import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import test from 'node:test';
import { contentConfig, getRenderingPolicy, pixelPerfectOptions } from '../src/content/babylon/config.js';
import { getInitializationMessage } from '../src/content/babylon/initialization.js';
import { getLogicalToRenderScale } from '../src/content/babylon/pixel-perfect.js';
import { getRenderScaleDisplayText } from '../src/content/babylon/showcase-overlay.js';
import { drawWorldHud, getWorldHudLayout, hitTestWorldHud } from '../src/content/babylon/world-hud.js';
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

test('keeps the logical camera focus and spinning title at world origin across target sizes', async () => {
  assert.equal(getLogicalToRenderScale(160, 90), 0.5);
  assert.equal(getLogicalToRenderScale(320, 180), 1);
  assert.equal(getLogicalToRenderScale(640, 360), 2);

  const content = await readFile(new URL('../src/content/Content.jsx', import.meta.url), 'utf8');
  assert.match(content, /positionPx: \[0, 0\]/);
  assert.match(content, /centerSprite2DView\(layer\.view, 0, 0, resolved\.width, resolved\.height\)/);
  assert.match(content, /layer\.view\.zoom = getLogicalToRenderScale/);
  assert.match(content, /setScale\(resolved\.scale\)/);
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
    resolutionWidth: 135,
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
    resolutionWidth: 270,
    resolutionLineWidth: 270,
  });

  assert.deepEqual(oneX.logo, twoX.logo);
  assert.equal(oneX.logo.width, 32);
  assert.equal(oneX.bottomInset, 9);
  assert.equal(oneX.hitTargets.openSettings.width, 18);
  assert.equal(oneX.hitTargets.cycleResolution.width, 135);
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
  assert.equal(drawn.filter(([kind]) => kind === 'text').length, 4);
  assert.equal(result.layout.lines[1].text, '(R) RenderResolution: 254x143');
  assert.equal(result.layout.lines[2].text, 'Render Scale: 0.25x');
  assert.equal(result.layout.lines[3].text, 'Mode: 2DPixelPerfect');
  assert.deepEqual(drawWorldHud(context, {}, { width: 1016, height: 572, visible: false }), { layout: null, hitTargets: {} });
});

test('uses the requested corner title/body styles and ties the Lite border to the React dialog', async () => {
  const [app, styles, content] = await Promise.all([
    readFile(new URL('../src/ui/App.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/ui/style.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/content/Content.jsx', import.meta.url), 'utf8'),
  ]);

  assert.match(app, /className="corner-title">/);
  assert.match(app, /RenderResolution: \$\{renderResolutionInfo\.width\}x\$\{renderResolutionInfo\.height\}/);
  assert.match(app, /renderPreset: "native"/);
  assert.match(app, /isRenderResolutionPreset\(saved\?\.renderPreset\)/);
  assert.match(app, /localStorage\.setItem\(configStorageKey, JSON\.stringify\(config\)\)/);
  assert.match(app, /key === "r" && !event\.repeat/);
  assert.doesNotMatch(app, /babylon_viewport_info|babylon_viewport_logo|babylonHudCompare/);
  assert.match(app, /activeDialog === "babylon" \? <div className="dialog_options babylon_settings"><div>Babylon Lite<\/div><div>\{renderResolutionText\}<\/div>/);
  assert.match(app, /worldHudVisible: hudVisible,/);
  assert.match(app, /className="babylon_accessible_controls"/);
  assert.match(app, /data-world-hud-title-style/);
  assert.match(app, /Mode: 2DPixelPerfect/);
  assert.match(app, /key === "b"/);
  assert.match(app, /event\.key === "Escape"/);
  assert.match(app, /sceneBorderVisible: activeDialog === "babylon"/);
  assert.match(app, /processingPaused: activeDialog !== null/);
  assert.match(app, /activeDialog === "babylon" \? <div className="dialog_options babylon_settings"/);
  assert.match(app, /className=\{activeDialog === "babylon" \? "babylon_settings_dialog"/);
  assert.doesNotMatch(styles, /\.babylon_viewport_info|\.babylon_viewport_logo|\.babylon_viewport_info_button/);
  assert.match(content, /layers: \[presentationLayer, hudLayer\]/);
  assert.match(content, /onClick=\{handleHudClick\}/);
  assert.match(content, /onPointerMove=\{handleHudPointerMove\}/);
  assert.match(content, /sceneBorderVisible && <div className="babylon_scene_border"/);
  assert.match(styles, /\.babylon_scene_border[\s\S]*border: 5px solid orange/);
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
  assert.match(content, /hudCanvas = document\.createElement\("canvas"\)/);
  assert.match(content, /hudCanvas\.getContext\("2d", \{ alpha: true \}\)/);
  assert.match(content, /createTexture2DFromPixels\(engine, pixels, width, height/);
  assert.match(content, /layers: \[presentationLayer, hudLayer\]/);
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
