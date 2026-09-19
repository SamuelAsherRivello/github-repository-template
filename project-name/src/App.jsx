import { useEffect, useState } from "react";
import versionText from "../../version.txt?raw";

const fullscreenStorageKey = "github-repository-template.fullscreen";
const repositoryUrl = "https://github.com/SamuelAsherRivello/github-repository-template";
const uiMarginPixels = 20;

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" width="20" height="20" fill="black">
      <path d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.71.4.08.55-.18.55-.4 0-.2-.01-.86-.01-1.56-2.01.38-2.53-.5-2.69-.96-.09-.24-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.91-3.64-4.04 0-.89.31-1.62.82-2.19-.08-.2-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.5 7.5 0 0 1 8 3.82c.68 0 1.36.09 2 .28 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.96.08 2.16.51.57.82 1.29.82 2.19 0 3.14-1.87 3.83-3.65 4.04.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .22.15.48.55.4A8.02 8.02 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z" />
    </svg>
  );
}

export function App() {
  const [fullscreenPreferred, setFullscreenPreferred] = useState(() => {
    return localStorage.getItem(fullscreenStorageKey) === "true";
  });

  const versionNumber = versionText.trim().replace(/^version=/, "").replace(/^v/, "");

  useEffect(() => {
    const uiLayer = document.getElementById("ui_layer");
    const syncUiMargin = () => {
      uiLayer?.style.setProperty("--ui-margin-x", `${(uiMarginPixels / window.innerWidth) * 100}%`);
      uiLayer?.style.setProperty("--ui-margin-y", `${(uiMarginPixels / window.innerHeight) * 100}%`);
    };

    syncUiMargin();
    window.addEventListener("resize", syncUiMargin);
    return () => window.removeEventListener("resize", syncUiMargin);
  }, []);

  useEffect(() => {
    localStorage.setItem(fullscreenStorageKey, fullscreenPreferred ? "true" : "false");
  }, [fullscreenPreferred]);

  useEffect(() => {
    const syncFullscreenState = () => {
      setFullscreenPreferred(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        if (!document.fullscreenElement) {
          setFullscreenPreferred(true);
        }
      }
    } catch {
      setFullscreenPreferred(false);
    }
  };

  return (
    <>
      <div className="corner corner_top_left">
        <div id="project_title" className="corner_body">
          GitHub Repository Template
        </div>
      </div>
      <div className="corner corner_top_right">
        <a href={repositoryUrl} target="_blank" rel="noopener noreferrer" aria-label="View the repository on GitHub" tabIndex={-1}>
          <GitHubMark />
        </a>
      </div>
      <div className="corner corner_bottom_left">
        <section id="settings" aria-labelledby="settings_title">
          <div id="settings_title" className="corner_title">
            Settings
          </div>
          <button
            id="fullscreen_toggle"
            className="corner_body settings_option"
            type="button"
            aria-pressed={fullscreenPreferred}
            tabIndex={-1}
            onClick={toggleFullscreen}
          >
            <span>Fullscreen</span>
            <span id="fullscreen_checkbox" aria-hidden="true">
              {fullscreenPreferred ? "☑" : "☐"}
            </span>
          </button>
        </section>
      </div>
      <div className="corner corner_bottom_right">
        <span id="version" className="corner_body">
          v{versionNumber}
        </span>
      </div>
    </>
  );
}
