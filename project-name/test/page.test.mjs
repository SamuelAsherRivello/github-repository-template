import { readFile } from "node:fs/promises";
import test from "node:test";
import viteConfig from "../../vite.config.js";

const appRoot = new URL("../", import.meta.url);

test("builds for the GitHub Pages project path", () => {
  if (viteConfig.base !== "/github-repository-template/") {
    throw new Error("The GitHub Pages build must use the repository project path as its Vite base.");
  }
});

test("documents the plain safe-area template", async () => {
  const page = await readFile(new URL("index.html", appRoot), "utf8");
  const app = await readFile(new URL("src/App.jsx", appRoot), "utf8");
  const styles = await readFile(new URL("src/style.css", appRoot), "utf8");

  if (!page.includes("<title>GitHub Repository Template</title>")) {
    throw new Error("The browser title must identify the template.");
  }
  if (!page.includes('id="content_layer"')) {
    throw new Error("The page needs a dedicated application content layer.");
  }
  if (!page.includes('id="ui_layer"')) {
    throw new Error("The page needs a separate HTML UI layer.");
  }
  if (!page.includes('src="/src/main.jsx"')) {
    throw new Error("The page must load the React application module.");
  }
  if (!app.includes("const uiMarginPixels = 20")) {
    throw new Error("The UI margin must be set from a single 20px target.");
  }
  if (!app.includes("--ui-margin-x") || !app.includes("--ui-margin-y")) {
    throw new Error("The UI margin must use separate percentage values for horizontal and vertical sides.");
  }
  if (!app.includes("window.innerWidth") || !app.includes("window.innerHeight")) {
    throw new Error("The UI margin percentages must be calculated from the viewport dimensions.");
  }
  if (!app.includes('window.addEventListener("resize", syncUiMargin)')) {
    throw new Error("The UI margin percentages must stay current when the viewport resizes.");
  }
  if (!styles.includes("inset: var(--ui-margin-y, 20px) var(--ui-margin-x, 20px)")) {
    throw new Error("The page must apply percentage-based UI margins with a 20px fallback.");
  }
  if (!styles.includes(".corner {")) {
    throw new Error("The page must define a reusable corner style.");
  }
  for (const cornerClass of ["corner_top_left", "corner_top_right", "corner_bottom_left", "corner_bottom_right"]) {
    if (!app.includes(`className="corner ${cornerClass}"`)) {
      throw new Error(`The page must include a ${cornerClass} corner instance.`);
    }
  }
  if (!app.includes('id="version"')) {
    throw new Error("The page must show the version footer.");
  }
  if (!app.includes("v{versionNumber}")) {
    throw new Error("The version corner must display versions in v0.0.0 format.");
  }
  if (!app.includes("Settings")) {
    throw new Error("The page must include a lower-left Settings section.");
  }
  if (!styles.includes(".corner_body") || !styles.includes(".corner_title")) {
    throw new Error("The page must define shared corner body and title text styles.");
  }
  if (!app.includes('id="settings_title"') || !app.includes('className="corner_title"')) {
    throw new Error("The Settings heading must use the bold corner title style.");
  }
  if (!app.includes('id="fullscreen_toggle"') || !app.includes('className="corner_body settings_option"')) {
    throw new Error("The fullscreen setting must use the shared corner body style.");
  }
  if (!app.includes("Fullscreen")) {
    throw new Error("The Settings section must include the Fullscreen option line.");
  }
  if (app.includes("Fullscreen (")) {
    throw new Error("The Fullscreen setting must not wrap the checkbox emoji in parentheses.");
  }
  if (!app.includes("☐") || !app.includes("☑")) {
    throw new Error("The fullscreen setting must use empty and checked checkbox emoji.");
  }
  if (!app.includes("localStorage.setItem(fullscreenStorageKey")) {
    throw new Error("The fullscreen setting must persist its preference locally.");
  }
  if (!app.includes("requestFullscreen") || !app.includes("exitFullscreen")) {
    throw new Error("The fullscreen setting must toggle the browser fullscreen API.");
  }
  if (!app.includes("https://github.com/SamuelAsherRivello/github-repository-template")) {
    throw new Error("The page must link to the template repository.");
  }
  if (!app.includes("tabIndex={-1}")) {
    throw new Error("The corner UI controls must be removed from the tabbing order.");
  }
  if (page.includes('src="/src/main.js"')) {
    throw new Error("The safe-area template should not load an application module.");
  }
});
