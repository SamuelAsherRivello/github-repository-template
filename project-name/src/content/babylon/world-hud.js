export const BABYLON_HUD_LOGO_SIZE = 32;
export const BABYLON_HUD_BOTTOM_INSET = 9;
const BABYLON_HUD_LOGO_OPTICAL_OFFSET = 0.5;
const BABYLON_HUD_TITLE_BASELINE_OFFSET = 1.5;
const BABYLON_HUD_BODY_BASELINE_OFFSET = 1;

export function getWorldHudLayout({
  width,
  height,
  devicePixelRatio = 1,
  titleLineHeight,
  bodyLineHeight,
  titleWidth,
  titleButtonWidth,
  resolutionWidth,
  resolutionLineWidth,
}) {
  const dpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  const cssWidth = width / dpr;
  const cssHeight = height / dpr;
  const logoSize = BABYLON_HUD_LOGO_SIZE;
  const blockHeight = logoSize + titleLineHeight + (3 * bodyLineHeight);
  const logoTop = cssHeight - BABYLON_HUD_BOTTOM_INSET - blockHeight;
  const titleTop = logoTop + logoSize;
  const resolutionTop = titleTop + titleLineHeight;
  const scaleTop = resolutionTop + bodyLineHeight;
  const modeTop = scaleTop + bodyLineHeight;

  const centeredLine = (top, lineHeight, measuredWidth) => ({
    left: (cssWidth - (measuredWidth / dpr)) / 2,
    top,
    width: measuredWidth / dpr,
    height: lineHeight,
  });
  const titleRect = centeredLine(titleTop, titleLineHeight, titleWidth);
  const resolutionRect = centeredLine(resolutionTop, bodyLineHeight, resolutionLineWidth);

  return {
    logo: {
      left: (cssWidth - logoSize) / 2 - BABYLON_HUD_LOGO_OPTICAL_OFFSET,
      top: logoTop - BABYLON_HUD_LOGO_OPTICAL_OFFSET,
      width: logoSize,
      height: logoSize,
    },
    lines: [
      { text: "(B) Babylon Lite", top: titleTop, lineHeight: titleLineHeight, width: titleWidth },
      { text: "", top: resolutionTop, lineHeight: bodyLineHeight, width: resolutionLineWidth },
      { text: "", top: scaleTop, lineHeight: bodyLineHeight, width: 0 },
      { text: "", top: modeTop, lineHeight: bodyLineHeight, width: 0 },
    ],
    hitTargets: {
      openSettings: { ...titleRect, width: titleButtonWidth / dpr },
      cycleResolution: resolutionRect,
    },
    devicePixelRatio: dpr,
    cssWidth,
    cssHeight,
    bottomInset: BABYLON_HUD_BOTTOM_INSET,
  };
}

function canvasFont(style, devicePixelRatio) {
  const fontSize = Number.parseFloat(style.fontSize) * devicePixelRatio;
  return `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
}

function baselineOffset(context, lineHeight) {
  const metrics = context.measureText("Mg");
  const ascent = metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent ?? 0;
  const descent = metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent ?? 0;
  return ((lineHeight - ascent - descent) / 2) + ascent;
}

export function drawWorldHud(context, logo, {
  width,
  height,
  devicePixelRatio = 1,
  visible = true,
  resolutionText,
  renderScaleText,
  modeText = "Mode: 2DPixelPerfect",
  titleStyle,
  bodyStyle,
  color = "#e0694b",
}) {
  context.clearRect(0, 0, width, height);
  if (!visible) return { layout: null, hitTargets: {} };

  const dpr = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  const titleFont = canvasFont(titleStyle, dpr);
  const bodyFont = canvasFont(bodyStyle, dpr);
  const titleLineHeight = Number.parseFloat(titleStyle.lineHeight);
  const bodyLineHeight = Number.parseFloat(bodyStyle.lineHeight);
  const title = "(B) Babylon Lite";
  const lines = [title, resolutionText, renderScaleText, modeText];

  context.save();
  context.textAlign = "center";
  context.textBaseline = "alphabetic";
  context.fillStyle = color;
  context.font = titleFont;
  const titleWidth = context.measureText(title).width;
  const titleButtonWidth = context.measureText("(B)").width;
  const resolutionWidth = context.measureText(resolutionText).width;
  context.font = bodyFont;
  const bodyWidths = lines.slice(1).map((line) => context.measureText(line).width);
  const layout = getWorldHudLayout({
    width,
    height,
    devicePixelRatio: dpr,
    titleLineHeight,
    bodyLineHeight,
    titleWidth,
    titleButtonWidth,
    resolutionWidth,
    resolutionLineWidth: bodyWidths[0],
  });

  context.imageSmoothingEnabled = true;
  if (logo) {
    context.drawImage(
      logo,
      layout.logo.left * dpr,
      layout.logo.top * dpr,
      layout.logo.width * dpr,
      layout.logo.height * dpr,
    );
  }

  context.font = titleFont;
  context.fillText(
    title,
    width / 2,
    (layout.lines[0].top * dpr) + baselineOffset(context, titleLineHeight * dpr) - (BABYLON_HUD_TITLE_BASELINE_OFFSET * dpr),
  );
  context.font = bodyFont;
  for (let index = 1; index < lines.length; index += 1) {
    const line = layout.lines[index];
    context.fillText(
      lines[index],
      width / 2,
      (line.top * dpr) + baselineOffset(context, bodyLineHeight * dpr) - (BABYLON_HUD_BODY_BASELINE_OFFSET * dpr),
    );
    line.text = lines[index];
    line.width = bodyWidths[index - 1];
  }
  context.restore();

  return { layout, hitTargets: layout.hitTargets };
}

export function hitTestWorldHud(point, hitTargets) {
  for (const [action, rect] of Object.entries(hitTargets ?? {})) {
    if (rect
      && point.x >= rect.left && point.x <= rect.left + rect.width
      && point.y >= rect.top && point.y <= rect.top + rect.height) return action;
  }
  return null;
}
