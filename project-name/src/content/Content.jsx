import { useEffect, useRef, useState } from "react";
import {
  addSpriteAnimation,
  addSprite2D,
  attachSpriteAnimationsToRenderer,
  centerSprite2DView,
  createRenderTexture2D,
  createTexture2DFromPixels,
  createGridSpriteAtlas,
  createSprite2DLayer,
  createSpriteAnimationManager,
  createSpriteFrameAnimation,
  createSpriteRenderer,
  createEngine,
  disposeEngine,
  disposeSpriteAnimationBinding,
  disposeSpriteAtlas,
  disposeSpriteRenderer,
  loadTexture2D,
  registerSpriteRenderer,
  releaseTexture,
  setSpriteRendererTarget,
  startEngine,
  stopEngine,
  updateTexture2DFromPixels,
  updateSprite2D,
} from "@babylonjs/lite";
import tileUrl from "./babylon/images/concentric-squares-32.png?url";
import logoUrl from "./babylon/images/babylon_logo_32x32.png?url";
import { contentConfig, getRenderingPolicy, logicalResolution, pixelPerfectOptions, showcaseTileSize } from "./babylon/config.js";
import { getInitializationMessage } from "./babylon/initialization.js";
import { getLogicalToRenderScale } from "./babylon/pixel-perfect.js";
import { createRenderTargetSurfaceView, getRenderResolutionDimensions } from "./babylon/render-resolution.js";
import { drawWorldHud, hitTestWorldHud } from "./babylon/world-hud.js";
import { useViewportInfo } from "../ui/ViewportInfoContext.jsx";

const TAU = Math.PI * 2;
const ROTATION_STEPS = 628;
const ROTATION_STEP_MS = 50;
const BACKGROUND = Object.freeze({ r: 1, g: 1, b: 1, a: 1 });

function PixelPerfectShowcase() {
  const {
    setScale,
    renderPreset,
    setRenderResolutionInfo,
    worldHudVisible,
    renderResolutionText,
    renderScaleText,
    modeText,
    openBabylonSettings,
    cycleRenderResolution,
    sceneBorderVisible,
    processingPaused,
  } = useViewportInfo();
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const processingPausedRef = useRef(processingPaused);
  const renderPresetRef = useRef(renderPreset);
  const applyRenderResolutionRef = useRef(null);
  const refreshWorldHudRef = useRef(null);
  const worldHudHitTargetsRef = useRef({});
  const worldHudInfoRef = useRef(null);
  const fpsTextRef = useRef("FPS: 000");
  const engineRef = useRef(null);
  const engineReadyRef = useRef(false);
  const engineRunningRef = useRef(false);
  const [message, setMessage] = useState("Starting Babylon Lite…");

  worldHudInfoRef.current = {
    visible: worldHudVisible,
    resolutionText: renderResolutionText,
    renderScaleText,
    modeText,
    openBabylonSettings,
    cycleRenderResolution,
  };

  useEffect(() => {
    renderPresetRef.current = renderPreset;
    applyRenderResolutionRef.current?.();
  }, [renderPreset]);

  useEffect(() => {
    refreshWorldHudRef.current?.();
  }, [worldHudVisible, renderResolutionText, renderScaleText, modeText]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    let cancelled = false;
    let disposed = false;
    let engine = null;
    let texture = null;
    let atlas = null;
    let renderTexture = null;
    let presentationAtlas = null;
    let presentationRenderer = null;
    let presentationSprite = null;
    let hudCanvas = document.createElement("canvas");
    let hudContext = hudCanvas.getContext("2d", { alpha: true });
    let hudLogo = new Image();
    let hudTexture = null;
    let hudAtlas = null;
    let hudLayer = null;
    let hudSprite = null;
    let hudWidth = 0;
    let hudHeight = 0;
    let nativeWidth = 0;
    let nativeHeight = 0;
    let renderSurface = null;
    let renderer = null;
    let layer = null;
    let sprite = null;
    let resizeObserver = null;
    let dprQuery = null;
    let animationBinding = null;
    let setupFinished = false;
    let failed = false;
    let fpsAnimationFrame = 0;
    let fpsWindowStart = 0;
    let fpsFrameCount = 0;

    const updateFps = (timestamp) => {
      if (cancelled) return;
      fpsFrameCount += 1;
      if (!fpsWindowStart) fpsWindowStart = timestamp;
      if (timestamp - fpsWindowStart >= 1000) {
        const fps = Math.min(999, Math.round((fpsFrameCount * 1000) / (timestamp - fpsWindowStart)));
        fpsTextRef.current = `FPS: ${String(fps).padStart(3, "0")}`;
        fpsWindowStart = timestamp;
        fpsFrameCount = 0;
        refreshWorldHudRef.current?.();
      }
      fpsAnimationFrame = window.requestAnimationFrame(updateFps);
    };

    const removeDprQuery = () => {
      dprQuery?.removeEventListener("change", handleDprChange);
      dprQuery = null;
    };
    const observeDpr = () => {
      removeDprQuery();
      dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
      dprQuery.addEventListener("change", handleDprChange, { once: true });
    };
    const getHudStyle = (selector) => {
      const element = document.querySelector(selector);
      if (!element) throw new Error(`Missing Babylon HUD style reference: ${selector}`);
      const style = window.getComputedStyle(element);
      return {
        fontStyle: style.fontStyle,
        fontWeight: style.fontWeight,
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        lineHeight: style.lineHeight,
      };
    };
    const drawHudPixels = (width, height, dpr) => {
      if (!hudContext) throw new Error("A 2D context is required to rasterize Babylon HUD glyphs.");
      if (hudCanvas.width !== width) hudCanvas.width = width;
      if (hudCanvas.height !== height) hudCanvas.height = height;
      const info = worldHudInfoRef.current;
      const result = drawWorldHud(hudContext, hudLogo, {
        width,
        height,
        devicePixelRatio: dpr,
        visible: info?.visible ?? false,
        resolutionText: info?.resolutionText ?? "",
        renderScaleText: info?.renderScaleText ?? "",
        modeText: info?.modeText ?? "Mode: 2DPixelPerfect",
        fpsText: fpsTextRef.current,
        titleStyle: getHudStyle("[data-world-hud-title-style]"),
        bodyStyle: getHudStyle("[data-world-hud-body-style]"),
      });
      worldHudHitTargetsRef.current = result.hitTargets;
      return Uint8Array.from(hudContext.getImageData(0, 0, width, height).data);
    };
    const updateHudTexture = (width, height, dpr) => {
      const pixels = drawHudPixels(width, height, dpr);
      if (hudTexture && hudWidth === width && hudHeight === height) {
        updateTexture2DFromPixels(engine, hudTexture, pixels);
        return;
      }
      if (hudAtlas) disposeSpriteAtlas(hudAtlas);
      if (hudTexture) releaseTexture(hudTexture);
      hudTexture = createTexture2DFromPixels(engine, pixels, width, height, {
        addressModeU: "clamp-to-edge",
        addressModeV: "clamp-to-edge",
        minFilter: "nearest",
        magFilter: "nearest",
      });
      hudAtlas = createGridSpriteAtlas(hudTexture, {
        cellWidthPx: width,
        cellHeightPx: height,
        columns: 1,
        rows: 1,
        pivot: [0.5, 0.5],
        premultipliedAlpha: false,
      });
      hudLayer = createSprite2DLayer(hudAtlas, { pivot: [0.5, 0.5], order: 1 });
      hudSprite = addSprite2D(hudLayer, {
        positionPx: [width / 2, height / 2],
        sizePx: [width, height],
        frame: 0,
      });
      hudWidth = width;
      hudHeight = height;
    };
    const updateRenderResolution = () => {
      if (!engine || !renderer || !host || !canvas || !sprite) return;
      const dpr = window.devicePixelRatio || 1;
      nativeWidth = Math.max(1, Math.floor(host.clientWidth * dpr));
      nativeHeight = Math.max(1, Math.floor(host.clientHeight * dpr));
      const resolved = getRenderResolutionDimensions(
        nativeWidth,
        nativeHeight,
        renderPresetRef.current,
        engine._device.limits.maxTextureDimension2D,
      );
      if (renderSurface) {
        renderSurface.canvas.width = resolved.width;
        renderSurface.canvas.height = resolved.height;
      }
      const sameTarget = renderTexture
        && renderTexture.width === resolved.width
        && renderTexture.height === resolved.height;
      const samePresentationSize = hudWidth === nativeWidth && hudHeight === nativeHeight;

      if (!sameTarget || !samePresentationSize || !presentationRenderer) {
        if (renderer) setSpriteRendererTarget(renderer, null);
        if (presentationRenderer) disposeSpriteRenderer(presentationRenderer);
        if (presentationAtlas) disposeSpriteAtlas(presentationAtlas);
        presentationRenderer = null;
        presentationAtlas = null;
        presentationSprite = null;
        if (!sameTarget) {
          if (renderTexture) releaseTexture(renderTexture);
          renderTexture = createRenderTexture2D(engine, resolved.width, resolved.height, {
            addressModeU: "clamp-to-edge",
            addressModeV: "clamp-to-edge",
            minFilter: "nearest",
            magFilter: "nearest",
          });
        }
        setSpriteRendererTarget(renderer, renderTexture);
        presentationAtlas = createGridSpriteAtlas(renderTexture, {
          cellWidthPx: resolved.width,
          cellHeightPx: resolved.height,
          columns: 1,
          rows: 1,
          pivot: [0.5, 0.5],
        });
        const presentationLayer = createSprite2DLayer(presentationAtlas, { pivot: [0.5, 0.5] });
        presentationSprite = addSprite2D(presentationLayer, {
          positionPx: [nativeWidth / 2, nativeHeight / 2],
          sizePx: [nativeWidth, nativeHeight],
          frame: 0,
        });
        updateHudTexture(nativeWidth, nativeHeight, dpr);
        presentationRenderer = createSpriteRenderer(engine, {
          layers: [presentationLayer, hudLayer],
          clear: true,
          clearValue: BACKGROUND,
        });
        registerSpriteRenderer(presentationRenderer);
      } else if (presentationSprite) {
        updateSprite2D(presentationSprite, {
          positionPx: [nativeWidth / 2, nativeHeight / 2],
          sizePx: [nativeWidth, nativeHeight],
        });
        updateSprite2D(hudSprite, {
          positionPx: [nativeWidth / 2, nativeHeight / 2],
          sizePx: [nativeWidth, nativeHeight],
        });
        updateHudTexture(nativeWidth, nativeHeight, dpr);
      }

      // The sprite stays at world origin (0, 0). Treat the Sprite2D layer view as
      // the 2D camera: keep its focus at origin and scale the same logical bounds
      // into each target size. Resolution changes therefore alter raster size,
      // not the title's world position or camera framing.
      layer.view.zoom = getLogicalToRenderScale(resolved.width, resolved.height, logicalResolution);
      centerSprite2DView(layer.view, 0, 0, resolved.width, resolved.height);
      setScale(resolved.scale);
      setRenderResolutionInfo({
        preset: resolved.preset,
        width: resolved.width,
        height: resolved.height,
        nativeWidth,
        nativeHeight,
      });
    };
    const updateRenderResolutionSafely = () => {
      try {
        updateRenderResolution();
      } catch (error) {
        failed = true;
        console.error("Babylon Lite render-resolution update failed:", error);
        if (engineRunningRef.current && engine) stopEngine(engine);
        engineRunningRef.current = false;
        disposeResources();
        if (!cancelled) setMessage(getInitializationMessage(Boolean(navigator.gpu), error));
      }
    };
    function handleDprChange() {
      updateRenderResolutionSafely();
      observeDpr();
    }
    const disposeResources = () => {
      if (disposed || !setupFinished) return;
      disposed = true;
      if (fpsAnimationFrame) window.cancelAnimationFrame(fpsAnimationFrame);
      animationBinding && disposeSpriteAnimationBinding(animationBinding);
      if (renderer) setSpriteRendererTarget(renderer, null);
      if (presentationRenderer) disposeSpriteRenderer(presentationRenderer);
      if (renderer) disposeSpriteRenderer(renderer);
      if (presentationAtlas) disposeSpriteAtlas(presentationAtlas);
      if (hudAtlas) disposeSpriteAtlas(hudAtlas);
      if (atlas) disposeSpriteAtlas(atlas);
      if (renderTexture) releaseTexture(renderTexture);
      if (hudTexture) releaseTexture(hudTexture);
      if (texture) releaseTexture(texture);
      if (engine) disposeEngine(engine);
      animationBinding = null;
      presentationRenderer = null;
      renderer = null;
      presentationAtlas = null;
      hudAtlas = null;
      hudTexture = null;
      hudLayer = null;
      hudSprite = null;
      atlas = null;
      renderTexture = null;
      renderSurface = null;
      texture = null;
      engine = null;
      engineRef.current = null;
      engineReadyRef.current = false;
      engineRunningRef.current = false;
    };

    const setup = async () => {
      try {
        if (!navigator.gpu) throw new Error("WebGPU is not available in this browser.");

        const createdEngine = await createEngine(canvas, pixelPerfectOptions.engine);
        if (cancelled) {
          engine = createdEngine;
          setupFinished = true;
          disposeResources();
          return;
        }
        engine = createdEngine;
        engineRef.current = engine;

        hudLogo.src = logoUrl;
        await hudLogo.decode();
        if (cancelled) {
          setupFinished = true;
          disposeResources();
          return;
        }

        const loadedTexture = await loadTexture2D(engine, tileUrl, pixelPerfectOptions.texture);
        if (cancelled) {
          texture = loadedTexture;
          setupFinished = true;
          disposeResources();
          return;
        }
        texture = loadedTexture;

        atlas = createGridSpriteAtlas(texture, {
          cellWidthPx: showcaseTileSize,
          cellHeightPx: showcaseTileSize,
          columns: 1,
          rows: 1,
          pivot: [0.5, 0.5],
        });
        layer = createSprite2DLayer(atlas, { pivot: [0.5, 0.5] });
        sprite = addSprite2D(layer, {
          positionPx: [0, 0],
          sizePx: [showcaseTileSize, showcaseTileSize],
          frame: 0,
        });

        const dpr = window.devicePixelRatio || 1;
        const initialWidth = Math.max(1, Math.floor(host.clientWidth * dpr));
        const initialHeight = Math.max(1, Math.floor(host.clientHeight * dpr));
        const initialRenderSize = getRenderResolutionDimensions(
          initialWidth,
          initialHeight,
          renderPresetRef.current,
          engine._device.limits.maxTextureDimension2D,
        );
        renderSurface = createRenderTargetSurfaceView(engine, initialRenderSize.width, initialRenderSize.height);
        renderer = createSpriteRenderer(renderSurface, {
          layers: [layer],
          clear: true,
          clearValue: BACKGROUND,
        });
        setSpriteRendererTarget(renderer, null);
        registerSpriteRenderer(renderer);

        const animationManager = createSpriteAnimationManager();
        addSpriteAnimation(animationManager, createSpriteFrameAnimation({
          setFrame(step) {
            if (!cancelled && sprite) updateSprite2D(sprite, { rotation: (step / ROTATION_STEPS) * TAU });
          },
        }, 0, ROTATION_STEPS - 1, true, ROTATION_STEP_MS));
        animationBinding = attachSpriteAnimationsToRenderer(renderer, animationManager);

        applyRenderResolutionRef.current = updateRenderResolutionSafely;
        refreshWorldHudRef.current = () => {
          if (!engine || !nativeWidth || !nativeHeight) return;
          try {
            updateHudTexture(nativeWidth, nativeHeight, window.devicePixelRatio || 1);
          } catch (error) {
            failed = true;
            console.error("Babylon Lite world HUD update failed:", error);
            if (!cancelled) setMessage(getInitializationMessage(Boolean(navigator.gpu), error));
          }
        };
        updateRenderResolution();

        await startEngine(engine);
        // StrictMode can unmount this effect while the first async engine start
        // is pending. Let finally dispose the engine without registering fresh
        // listeners or observers after cleanup has already run.
        if (cancelled) return;
        if (failed) throw new Error("Babylon Lite render-resolution setup failed.");
        engineReadyRef.current = true;
        engineRunningRef.current = true;
        if (processingPausedRef.current) {
          stopEngine(engine);
          engineRunningRef.current = false;
        }
        fpsAnimationFrame = window.requestAnimationFrame(updateFps);
        resizeObserver = new ResizeObserver(updateRenderResolutionSafely);
        resizeObserver.observe(host);
        window.addEventListener("resize", updateRenderResolutionSafely);
        observeDpr();
        if (!cancelled) setMessage("");
      } catch (error) {
        failed = true;
        console.error("Babylon Lite content initialization failed:", error);
        if (!cancelled) setMessage(getInitializationMessage(Boolean(navigator.gpu), error));
      } finally {
        setupFinished = true;
        if (cancelled || failed) disposeResources();
      }
    };

    // Let StrictMode's immediate setup/cleanup probe finish before touching the
    // canvas. A cancelled probe must not asynchronously create an engine that can
    // unconfigure the canvas context owned by the surviving mount.
    queueMicrotask(() => {
      if (!cancelled) void setup();
    });
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateRenderResolutionSafely);
      removeDprQuery();
      applyRenderResolutionRef.current = null;
      refreshWorldHudRef.current = null;
      worldHudHitTargetsRef.current = {};
      disposeResources();
    };
  }, []);

  useEffect(() => {
    processingPausedRef.current = processingPaused;
    const engine = engineRef.current;
    if (!engine || !engineReadyRef.current) return;

    if (processingPaused && engineRunningRef.current) {
      stopEngine(engine);
      engineRunningRef.current = false;
    } else if (!processingPaused && !engineRunningRef.current) {
      engineRunningRef.current = true;
      void startEngine(engine);
    }
  }, [processingPaused]);

  const handleHudClick = (event) => {
    const host = hostRef.current;
    if (!host) return;
    const bounds = host.getBoundingClientRect();
    const action = hitTestWorldHud({ x: event.clientX - bounds.left, y: event.clientY - bounds.top }, worldHudHitTargetsRef.current);
    if (action === "openSettings") worldHudInfoRef.current?.openBabylonSettings?.();
    if (action === "cycleResolution") worldHudInfoRef.current?.cycleRenderResolution?.();
  };
  const handleHudPointerMove = (event) => {
    const bounds = hostRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const action = hitTestWorldHud({ x: event.clientX - bounds.left, y: event.clientY - bounds.top }, worldHudHitTargetsRef.current);
    event.currentTarget.style.cursor = action ? "pointer" : "";
  };

  return (
    <div ref={hostRef} className="babylon_content" data-renderer="babylon-lite" data-content-style="2d" onClick={handleHudClick} onPointerMove={handleHudPointerMove} onPointerLeave={(event) => { event.currentTarget.style.cursor = ""; }}>
      <canvas ref={canvasRef} className="babylon_canvas" aria-hidden="true" />
      {sceneBorderVisible && <div className="babylon_scene_border" aria-hidden="true" />}
      {message && <div className="babylon_content_message" role="status">{message}</div>}
    </div>
  );
}

export function Content() {
  const renderingPolicy = getRenderingPolicy(contentConfig);
  if (renderingPolicy === "performance-scaled-3d") {
    return (
      <div className="babylon_content babylon_content_message" data-renderer="babylon-lite" data-content-style="3d">
        3D content is selected. Configure its Babylon Lite scene with the Performance-scaled 3D policy in the integration guide.
      </div>
    );
  }
  if (renderingPolicy !== "pixel-perfect") {
    return <div className="babylon_content babylon_content_message" role="status">Select Babylon Lite with 2D content or add the renderer-specific integration described in the guide.</div>;
  }

  return <PixelPerfectShowcase />;
}
