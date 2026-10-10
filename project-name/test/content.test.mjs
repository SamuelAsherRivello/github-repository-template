import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import test from 'node:test';
import { contentConfig, getRenderingPolicy, pixelPerfectOptions } from '../src/content/babylon/config.js';
import { getInitializationMessage } from '../src/content/babylon/initialization.js';
import { getLogicalToRenderScale } from '../src/content/babylon/pixel-perfect.js';
import {
  BabylonLiteAIEntry,
  BabylonLiteMode,
  snapPositionPxThroughView,
} from '../src/content/babylon/pixel-grid-entry.js';
import { getRenderScaleDisplayText } from '../src/content/babylon/showcase-overlay.js';
import { BABYLON_HUD_LOGO_SIZE, drawWorldHud, getWorldHudLayout, hitTestWorldHud } from '../src/content/babylon/world-hud.js';
import {
  createRenderTargetSurfaceView,
  cycleRenderResolutionPreset,
  getRenderResolutionDimensions,
} from '../src/content/babylon/render-resolution.js';

test('defaults to Babylon Lite 2D and does not apply the pixel preset to 3D', () => {
  assert.deepEqual(contentConfig, { renderer: 'babylon-lite', style: '2d' });
  assert.equal(getRenderingPolicy(contentConfig), 'pixel-perfect');
  assert.equal(getRenderingPolicy({ renderer: 'babylon-lite', style: '3d' }), 'performance-scaled-3d');
  assert.equal(getRenderingPolicy({ renderer: 'other', style: '2d' }), 'renderer-specific');
  assert.deepEqual(pixelPerfectOptions.engine, { msaaSamples: 1 });
  assert.deepEqual(pixelPerfectOptions.texture, {
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge',
    minFilter: 'nearest',
    magFilter: 'nearest',
    mipMaps: false,
  });
});

test('derives four relative render resolutions from native backing dimensions and caps double by the WebGPU limit', () => {
  assert.deepEqual(getRenderResolutionDimensions(1280, 720, 'quarter'), {
    preset: 'quarter', width: 320, height: 180, scale: 0.25,
  });
  assert.deepEqual(getRenderResolutionDimensions(1280, 720, 'half'), {
    preset: 'half', width: 640, height: 360, scale: 0.5,
  });
  assert.deepEqual(getRenderResolutionDimensions(1280, 720, 'native'), {
    preset: 'native', width: 1280, height: 720, scale: 1,
  });
  assert.deepEqual(getRenderResolutionDimensions(1280, 720, 'double'), {
    preset: 'double', width: 2560, height: 1440, scale: 2,
  });
  assert.deepEqual(getRenderResolutionDimensions(10000, 5000, 'double', 8192), {
    preset: 'double', width: 8192, height: 4096, scale: 0.8192,
  });
  const oddHalf = getRenderResolutionDimensions(923, 520, 'half');
  assert.deepEqual([oddHalf.preset, oddHalf.width, oddHalf.height], ['half', 461, 260]);
  assert.ok(Math.abs(oddHalf.scale - 0.5) < 0.001);
  assert.deepEqual(getRenderResolutionDimensions(0, 520, 'double'), {
    preset: 'double', width: 0, height: 0, scale: 0,
  });
  assert.deepEqual([
    'quarter', 'half', 'native', 'double',
    cycleRenderResolutionPreset('double'), cycleRenderResolutionPreset('invalid'),
  ], [
    'quarter', 'half', 'native', 'double', 'quarter', 'double',
  ]);
});

test('snaps Babylon Lite sprite anchors after the layer view and preserves the grid on round trip', async () => {
  const { sprite2DWorldToScreenToRef } = await import('@babylonjs/lite');
  const view = { positionPx: [0.5, -0.5], zoom: 1, rotation: 0 };
  const snapped = snapPositionPxThroughView(view, [10.2, 2.2]);
  const projected = sprite2DWorldToScreenToRef(view, snapped[0], snapped[1], { x: 0, y: 0 });

  assert.deepEqual(projected, { x: 10, y: 3 });
  assert.deepEqual(snapPositionPxThroughView(view, snapped), snapped);
});

test('snaps correctly through a zoomed and rotated Babylon Lite layer view', async () => {
  const { sprite2DWorldToScreenToRef } = await import('@babylonjs/lite');
  const view = { positionPx: [3.25, -4.5], zoom: 2, rotation: Math.PI / 2 };
  const snapped = snapPositionPxThroughView(view, [10.2, 2.2]);
  const projected = sprite2DWorldToScreenToRef(view, snapped[0], snapped[1], { x: 0, y: 0 });

  assert.equal(Number.isInteger(projected.x), true);
  assert.equal(Number.isInteger(projected.y), true);
  assert.deepEqual(snapPositionPxThroughView(view, snapped), snapped);
});

test('requires explicit mode setup and resnaps a layer after view changes', () => {
  assert.throws(
    () => BabylonLiteAIEntry.addSprite({}, { positionPx: [0, 0] }),
    /configure/,
  );
  assert.throws(
    () => BabylonLiteAIEntry.configure({ mode: '3d' }),
    /Unsupported or missing Babylon Lite mode/,
  );
  BabylonLiteAIEntry.configure({ mode: BabylonLiteMode.PixelPerfect2D });

  const layer = { view: { positionPx: [0, 0], zoom: 1, rotation: 0 } };
  BabylonLiteAIEntry.updateView(layer, {
    positionPx: [0.5, -0.25],
    zoom: 2,
    rotation: Math.PI / 2,
  });
  assert.deepEqual(layer.view, {
    positionPx: [0.5, -0.25],
    zoom: 2,
    rotation: Math.PI / 2,
  });
  assert.throws(
    () => BabylonLiteAIEntry.updateView(layer, { offset: [1, 2] }),
    /Unsupported Babylon Lite view property/,
  );
});

test('rejects Babylon Lite sprite mutations outside the pixel-grid entry module', async () => {
  const allowedFile = 'content/babylon/pixel-grid-entry.js';
  const mutationPattern = /\b(?:addSprite2D|updateSprite2D)\s*\(/;
  const liteImportPattern = /import\s*\{[^}]*\b(?:addSprite2D|updateSprite2D)\b[^}]*\}\s*from\s*["']@babylonjs\/lite["']/s;
  const namespaceMutationPattern = /\b[A-Za-z_$][\w$]*\.(?:addSprite2D|updateSprite2D)\s*\(/;
  const viewMutationPattern = /\b[A-Za-z_$][\w$]*\.view\.(?:positionPx(?:\[\d+\])?|zoom|rotation)\s*=/;
  const viewHelperPattern = /\bcenterSprite2DView\s*\(/;
  const rendererHelperPattern = /\bBabylonLiteAIEntry\.(?:addPresentationSprite|updatePresentationSprite)\s*\(/;

  function findBypasses(sources) {
    return sources.flatMap(({ file, source }) => {
      if (file.replaceAll('\\', '/').endsWith(allowedFile)) return [];
      const rendererHelperOutsideContent = rendererHelperPattern.test(source)
        && !file.replaceAll('\\', '/').endsWith('content/Content.jsx');
      return mutationPattern.test(source)
        || liteImportPattern.test(source)
        || namespaceMutationPattern.test(source)
        || viewMutationPattern.test(source)
        || viewHelperPattern.test(source)
        || rendererHelperOutsideContent
        ? [file]
        : [];
    });
  }

  async function listSources(directory, prefix = '') {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map(async (entry) => {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolute = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
      if (entry.isDirectory()) return listSources(absolute, relative);
      if (!/\.jsx?$/.test(entry.name)) return [];
      return [{ file: relative, source: await readFile(absolute, 'utf8') }];
    }));
    return nested.flat();
  }

  const sourceDirectory = new URL('../src/', import.meta.url);
  const sources = await listSources(sourceDirectory);
  assert.deepEqual(findBypasses(sources), []);
  assert.deepEqual(findBypasses([{
    file: 'game/player.js',
    source: 'import { updateSprite2D } from "@babylonjs/lite"; updateSprite2D(player, { positionPx: [1, 2] });',
  }]), ['game/player.js']);
  assert.deepEqual(findBypasses([{
    file: 'game/camera.js',
    source: 'layer.view.positionPx[0] = cameraX; layer.view.zoom = 2;',
  }]), ['game/camera.js']);
  assert.deepEqual(findBypasses([{
    file: 'game/player.js',
    source: 'BabylonLiteAIEntry.updatePresentationSprite(player, { positionPx: [1, 2] });',
  }]), ['game/player.js']);
});

test('keeps the logical camera focus and spinning title at world origin across target sizes', async () => {
  assert.equal(getLogicalToRenderScale(160, 90), 0.5);
  assert.equal(getLogicalToRenderScale(320, 180), 1);
  assert.equal(getLogicalToRenderScale(640, 360), 2);

  const content = await readFile(new URL('../src/content/Content.jsx', import.meta.url), 'utf8');
  assert.match(content, /positionPx: \[0, 0\]/);
  assert.match(content, /BabylonLiteAIEntry\.centerView\(layer, 0, 0, resolved\.width, resolved\.height\)/);
  assert.match(content, /BabylonLiteAIEntry\.updateView\(layer,\s*\{\s*zoom: getLogicalToRenderScale/);
  assert.match(content, /setRenderScale\(resolved\.scale\)/);
});

test('adapts Babylon Lite sprite projection dimensions while sharing the engine surface registry', () => {
  const contexts = [];
  const engine = {
    engine: null,
    canvas: { width: 1280, height: 720 },
    _renderingContexts: contexts,
    format: 'bgra8unorm',
  };
  engine.engine = engine;
  const targetSurface = createRenderTargetSurfaceView(engine, 640, 360);

  assert.equal(targetSurface.engine, engine);
  assert.equal(targetSurface._renderingContexts, contexts);
  assert.equal(targetSurface.format, engine.format);
  assert.deepEqual([targetSurface.canvas.width, targetSurface.canvas.height], [640, 360]);
  targetSurface.canvas.width = 800;
  assert.deepEqual([targetSurface.canvas.width, targetSurface.canvas.height], [800, 360]);
  assert.deepEqual([engine.canvas.width, engine.canvas.height], [1280, 720]);
});

test('formats the active internal render scale independently of the CSS viewport', () => {
  assert.equal(getRenderScaleDisplayText(1), 'Render Scale: 1x');
  assert.equal(getRenderScaleDisplayText(0.5), 'Render Scale: 0.5x');
  assert.equal(getRenderScaleDisplayText(2), 'Render Scale: 2x');
  assert.equal(getRenderScaleDisplayText(0.8192), 'Render Scale: 0.82x');

});

test('keeps the Babylon Lite world HUD at the existing CSS-pixel position across DPRs', () => {
  const oneX = getWorldHudLayout({
    width: 1016,
    height: 572,
    devicePixelRatio: 1,
    titleLineHeight: 18.6667,
    bodyLineHeight: 14.9333,
    titleWidth: 91,
    titleButtonWidth: 18,
    resolutionLineWidth: 135,
  });
  const twoX = getWorldHudLayout({
    width: 2032,
    height: 1144,
    devicePixelRatio: 2,
    titleLineHeight: 18.6667,
    bodyLineHeight: 14.9333,
    titleWidth: 182,
    titleButtonWidth: 36,
    resolutionLineWidth: 270,
  });

  assert.deepEqual(oneX.logo, twoX.logo);
  assert.equal(oneX.logo.width, BABYLON_HUD_LOGO_SIZE);
  assert.equal(oneX.bottomInset, 9);
  assert.equal(oneX.hitTargets.openSettings.width, 18);
  assert.equal(oneX.hitTargets.cycleResolution.width, 135);
  assert.equal(oneX.lines[4].top < oneX.logo.top, true);
  assert.ok(Math.abs((oneX.lines[3].top + oneX.lines[3].lineHeight) - (oneX.cssHeight - oneX.bottomInset)) < 1e-9);
  assert.equal(hitTestWorldHud({ x: 470, y: oneX.hitTargets.openSettings.top + 1 }, oneX.hitTargets), 'openSettings');
  assert.equal(hitTestWorldHud({ x: 500, y: oneX.hitTargets.cycleResolution.top + 1 }, oneX.hitTargets), 'cycleResolution');
  assert.equal(hitTestWorldHud({ x: 10, y: 10 }, oneX.hitTargets), null);
});

test('draws the live Babylon Lite readout and clears a hidden HUD', () => {
  const drawn = [];
  const context = {
    clearRect() {}, save() {}, restore() {}, drawImage(...args) { drawn.push(['image', ...args]); },
    measureText(text) {
      const size = Number.parseFloat(this.font.match(/[0-9.]+px/)[0]);
      return { width: text.length * size * 0.5, fontBoundingBoxAscent: size * 0.75, fontBoundingBoxDescent: size * 0.25 };
    },
    fillText(...args) { drawn.push(['text', this.fillStyle, ...args]); },
  };
  const titleStyle = { fontStyle: 'normal', fontWeight: '700', fontSize: '13.333px', fontFamily: 'serif', lineHeight: '18.666px' };
  const bodyStyle = { fontStyle: 'normal', fontWeight: '400', fontSize: '10.667px', fontFamily: 'serif', lineHeight: '14.933px' };
  const result = drawWorldHud(context, {}, {
    width: 1016,
    height: 572,
    resolutionText: '(R) RenderResolution: 254x143',
    renderScaleText: 'Render Scale: 0.25x',
    titleStyle,
    bodyStyle,
  });

  assert.ok(drawn.filter(([kind]) => kind === 'text').every(([, color]) => color === '#e0694b'));
  assert.equal(drawn.filter(([kind]) => kind === 'text').length, 5);
  assert.equal(result.layout.lines[1].text, '(R) RenderResolution: 254x143');
  assert.equal(result.layout.lines[2].text, 'Render Scale: 0.25x');
  assert.equal(result.layout.lines[3].text, 'Mode: 2DPixelPerfect');
  assert.equal(result.layout.lines[4].text, 'FPS: 000');
  assert.deepEqual(drawWorldHud(context, {}, { width: 1016, height: 572, visible: false }), { layout: null, hitTargets: {} });
});

test('keeps the shell renderer-neutral and wires Babylon presentation through optional slots', async () => {
  const [app, styles, content, presentation, shellContext, main, surface] = await Promise.all([
    readFile(new URL('../src/ui/App.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/style.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/content/Content.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/content/babylon/BabylonPresentation.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/shared/ContentShellContext.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/main.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/BrowserSurface.jsx', import.meta.url), 'utf8'),
  ]);

  assert.match(app, /className="corner-title">/);
  assert.doesNotMatch(app, /content\/babylon/);
  assert.match(app, /contentPresentation\?\.Readout/);
  assert.match(app, /contentPresentation\?\.Settings/);
  assert.match(app, /writeProjectConfigPatch\(localStorage, config\)/);
  assert.doesNotMatch(app, /key === "r"|renderResolution/);
  assert.doesNotMatch(app, /renderPreset|renderResolution|babylon/i);
  assert.match(app, /key === "b" && contentPresentation\?\.Settings/);
  assert.match(app, /contentSettingsOpen && <div className="content_focus_border"/);
  assert.match(app, /event\.key === "Escape"/);
  assert.doesNotMatch(styles, /\.babylon_viewport_info|\.babylon_viewport_logo|\.babylon_viewport_info_button/);
  assert.match(styles, /\.content_focus_border[\s\S]*border: 5px solid orange/);
  assert.match(shellContext, /createContext\(\{ paused: false \}\)/);
  assert.match(shellContext, /ContentShellProvider/);
  assert.match(presentation, /readProjectConfig\(localStorage\)/);
  assert.match(presentation, /isRenderResolutionPreset\(renderPreset\)/);
  assert.match(presentation, /writeProjectConfigPatch\(localStorage, \{ renderPreset \}\)/);
  assert.match(presentation, /className="babylon_readout"/);
  assert.match(presentation, /\(B\) Babylon Lite/);
  assert.match(presentation, /FPS: \{String\(fps\)\.padStart\(3, "0"\)\}/);
  assert.match(presentation, /timestamp - windowStart >= 1000/);
  assert.match(presentation, /event\.key\.toLowerCase\(\) === "r" && !event\.repeat/);
  assert.match(presentation, /Mode: 2DPixelPerfect/);
  assert.match(main, /contentPresentation=\{\{/);
  assert.match(main, /BabylonPresentationProvider/);
  assert.doesNotMatch(surface, /Babylon Lite content/);
  assert.doesNotMatch(content, /drawWorldHud|hitTestWorldHud|getImageData|updateTexture2DFromPixels|createTexture2DFromPixels/);
  assert.match(content, /const \{ paused \} = useContentShell\(\)/);
  assert.match(content, /useBabylonPresentation\(\)/);
  assert.match(content, /\[paused\]/);
});

test('reports WebGPU-only initialization and allocation failures and uses the engine-owned frame lifecycle', async () => {
  assert.match(getInitializationMessage(false, new Error('unsupported')), /requires WebGPU/);
  assert.match(getInitializationMessage(true, new Error('WebGPU adapter not available')), /requires WebGPU/);
  assert.match(getInitializationMessage(true, new Error('texture decode failed')), /could not initialize/);
  assert.match(getInitializationMessage(true, new Error('render target allocation failed')), /could not allocate the selected render resolution/);
  assert.match(getInitializationMessage(true, new Error('GPU out of memory while allocating texture')), /could not allocate the selected render resolution/);

  const [content, main] = await Promise.all([
    readFile(new URL('../src/content/Content.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/main.jsx', import.meta.url), 'utf8'),
  ]);
  assert.match(main, /<StrictMode>/);
  for (const expression of [
    /cancelled = false/,
    /cancelled = true/,
    /resizeObserver\?\.disconnect\(\)/,
    /window\.removeEventListener\("resize"/,
    /removeDprQuery\(\)/,
    /disposeSpriteRenderer\(renderer\)/,
    /releaseTexture\(texture\)/,
    /disposeEngine\(engine\)/,
    /disposeSpriteAnimationBinding\(animationBinding\)/,
  ]) assert.match(content, expression);
  assert.match(content, /await createEngine\(canvas, pixelPerfectOptions\.engine\)/);
  assert.match(content, /queueMicrotask\(\(\) => \{\s*if \(!cancelled\) void setup\(\);\s*\}\)/);
  assert.match(content, /if \(!navigator\.gpu\) throw new Error\("WebGPU is not available in this browser\."\)/);
  assert.match(content, /setMessage\(getInitializationMessage\(Boolean\(navigator\.gpu\), error\)\)/);
  assert.match(content, /createEngine\(canvas, pixelPerfectOptions\.engine\)/);
  assert.doesNotMatch(content, /hudCanvas|hudTexture|hudLayer|drawWorldHud|hitTestWorldHud|getImageData/);
  assert.doesNotMatch(content, /\.getContext\(["']webgl2?["']/i);
  assert.match(content, /await startEngine\(engine\)/);
  assert.match(content, /await startEngine\(engine\);\s*\/\/ StrictMode can unmount this effect while the first async engine start[\s\S]*?if \(cancelled\) return;/);
});

test('imports an original 32x32 hard-edged PNG with only black and gray pixels', async () => {
  const png = await readFile(new URL('../src/content/babylon/images/concentric-squares-32.png', import.meta.url));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);

  let offset = 8;
  const idat = [];
  let width;
  let height;
  while (offset < png.length) {
    const size = png.readUInt32BE(offset);
    const type = png.toString('ascii', offset + 4, offset + 8);
    const data = png.subarray(offset + 8, offset + 8 + size);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idat.push(data);
    }
    offset += size + 12;
    if (type === 'IEND') break;
  }

  assert.equal(width, 32);
  assert.equal(height, 32);
  const decoded = inflateSync(Buffer.concat(idat));
  const shades = new Set();
  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    assert.equal(decoded[rowStart], 0, 'asset rows use the exact, non-smoothed PNG filter');
    for (let x = 0; x < width; x++) {
      const pixel = rowStart + 1 + x * 4;
      assert.equal(decoded[pixel], decoded[pixel + 1]);
      assert.equal(decoded[pixel], decoded[pixel + 2]);
      assert.equal(decoded[pixel + 3], 255);
      shades.add(decoded[pixel]);
    }
  }
  assert.deepEqual([...shades].sort((a, b) => a - b), [0, 64, 128, 192]);
});
