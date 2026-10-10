import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import viteConfig from '../../vite.config.js';
import { defaultLayout, fitViewport, validateLayout } from '../src/ui/layout.js';
import { projectConfigStorageKey, readProjectConfig, writeProjectConfigPatch } from '../src/shared/projectConfigStorage.js';

test('keeps npm/application and GitHub Pages roots', () => {
  assert.equal(viteConfig.root, 'project-name');
  assert.equal(viteConfig.base, '/github-repository-template/');
});
test('fits orientations and project-defined ratios in CSS pixels', () => {
  for (const layout of [defaultLayout, {orientation:'portrait',width:9,height:16}, {orientation:'square',width:1,height:1}, {orientation:'landscape',width:7,height:3}]) {
    for (const [w,h] of [[1600,900],[400,900],[800,800],[160,100]]) {
      const fit = fitViewport(w,h,layout);
      assert.ok(fit.width <= w && fit.height <= h + 1e-9);
      assert.ok(Math.abs(fit.width/fit.height - layout.width/layout.height) < 1e-9);
      assert.equal(fit.x*2+fit.width,w);
      assert.equal(fit.y*2+fit.height,h);
      assert.ok(fit.width>0 && fit.height>0);
    }
  }
});
test('invalid dimensions and orientation give actionable errors', () => {
  for (const width of [0,-1,Infinity,NaN,'16']) assert.throws(() => validateLayout({...defaultLayout,width}), /finite positive/);
  assert.throws(() => validateLayout({orientation:'portrait',width:16,height:9}), /orientation must match/);
  assert.throws(() => validateLayout({...defaultLayout,orientation:'unknown'}), /orientation must match/);
  assert.throws(() => fitViewport(-1,900,defaultLayout), /nonnegative CSS/);
  assert.deepEqual(fitViewport(0,0,defaultLayout), {width:0,height:0,x:0,y:0});
});
test('renderer settings patch the shared config without dropping shell preferences', () => {
  const values = new Map([[projectConfigStorageKey, JSON.stringify({ renderPreset: 'half', hudVisible: false })]]);
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };

  assert.equal(writeProjectConfigPatch(storage, { fullscreen: true }), true);
  assert.deepEqual(readProjectConfig(storage), {
    renderPreset: 'half',
    hudVisible: false,
    fullscreen: true,
  });
  assert.equal(writeProjectConfigPatch(storage, { renderPreset: 'quarter' }), true);
  assert.deepEqual(readProjectConfig(storage), {
    renderPreset: 'quarter',
    hudVisible: false,
    fullscreen: true,
  });
});
test('preserves corner contracts and engine-neutral content-layer guidance', async () => {
  const read = name => readFile(new URL('../'+name,import.meta.url),'utf8');
  const [app,surface,main,html,guide] = await Promise.all([read('src/ui/App.jsx'),read('src/ui/BrowserSurface.jsx'),read('src/main.jsx'),read('index.html'),read('../docs/layout-and-game-integration.md')]);
  assert.ok(main.includes('getElementById("root")'));
  assert.ok(html.includes('id="root"'));
  for (const id of ['content_layer','ui_layer','viewport','browser_surface']) assert.ok(surface.includes('id="'+id+'"'));
  for (const position of ['top_left','top_right','bottom_left','bottom_right']) assert.ok(app.includes('<Corner position="'+position+'">'));
  assert.match(app,/versionText.*trim/);
  assert.match(app,/noopener noreferrer/);
  assert.match(app,/github-repository-template.fullscreen/);
  assert.match(surface,/Selected content mounts beneath the independent UI layer/);
  assert.doesNotMatch(surface,/Babylon Lite content mounts here|future Babylon Lite integration/i);
  for (const term of ['Logical resolution','Internal render resolution','Canvas backing resolution','Display size','CSS size','fractional','StrictMode']) assert.ok(guide.includes(term));
  assert.doesNotMatch(surface,/import.*babylon/i);
});
test('keeps the UI and content source boundaries discoverable', async () => {
  const read = name => readFile(new URL('../' + name, import.meta.url), 'utf8');
  const [main, template, content, standards] = await Promise.all([
    read('src/main.jsx'),
    read('src/ui/Template.jsx'),
    read('src/content/Content.jsx'),
    read('../docs/coding-standards.md'),
  ]);
  assert.match(main, /\.\/ui\/App\.jsx/);
  assert.match(main, /\.\/content\/Content\.jsx/);
  assert.match(main, /<AppComposition \/>/);
  assert.match(main, /contentPresentation=\{\{/);
  assert.match(main, /BabylonPresentationProvider/);
  assert.match(template, /export function Template/);
  assert.match(content, /export function Content/);
  assert.match(standards, /src\/ui\//);
  assert.match(standards, /src\/content\//);
});

test('renders the shell without a presentation and with a stub presentation', async () => {
  const priorWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const priorStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1 },
  });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null, setItem() {}, clear() {} },
  });

  const server = await createServer({
    configFile: fileURLToPath(new URL('../../vite.config.js', import.meta.url)),
    server: { middlewareMode: true },
    appType: 'custom',
  });
  try {
    const { App } = await server.ssrLoadModule('/src/ui/App.jsx');
    const StubReadout = () => createElement('div', null, 'Stub engine status');
    const StubSettings = () => createElement('div', null, 'Stub engine settings');
    const withoutPresentation = renderToStaticMarkup(createElement(App));
    const withPresentation = renderToStaticMarkup(createElement(App, {
      contentPresentation: {
        title: 'Stub engine',
        Readout: StubReadout,
        Settings: StubSettings,
      },
    }));

    assert.match(withoutPresentation, /id="browser_surface"/);
    assert.doesNotMatch(withoutPresentation, /Babylon Lite|Stub engine/);
    assert.match(withPresentation, /Stub engine status/);
    assert.doesNotMatch(withPresentation, /Babylon Lite/);
  } finally {
    await server.close();
    if (priorWindow) Object.defineProperty(globalThis, 'window', priorWindow);
    else delete globalThis.window;
    if (priorStorage) Object.defineProperty(globalThis, 'localStorage', priorStorage);
    else delete globalThis.localStorage;
  }
});
