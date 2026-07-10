import { tokens } from "./tokens.js";

/**
 * Serializes tokens to CSS custom properties on :root.
 * The web app injects this once; components consume var(--cs-*) or the
 * Tailwind preset — never literal values.
 */
const entries: ReadonlyArray<readonly [string, string]> = [
  ["--cs-color-paper", tokens.color.paper],
  ["--cs-color-ink", tokens.color.ink],
  ["--cs-color-ink-soft", tokens.color.inkSoft],
  ["--cs-color-peacock", tokens.color.peacock],
  ["--cs-color-peacock-deep", tokens.color.peacockDeep],
  ["--cs-color-stamp", tokens.color.stamp],
  ["--cs-color-pause", tokens.color.pauseAmber],
  ["--cs-color-pause-bg", tokens.color.pauseAmberBg],
  ["--cs-color-notice", tokens.color.noticeBlue],
  ["--cs-color-notice-bg", tokens.color.noticeBlueBg],
  ["--cs-color-ok", tokens.color.okGreen],
  ["--cs-color-ok-bg", tokens.color.okGreenBg],
  ["--cs-color-warn", tokens.color.warnRed],
  ["--cs-color-warn-bg", tokens.color.warnRedBg],
  ["--cs-color-on-peacock", tokens.color.onPeacock],
  ["--cs-font-display", tokens.font.display],
  ["--cs-font-body", tokens.font.body],
  ["--cs-size-touch", tokens.size.touchTarget],
  ["--cs-size-button", tokens.size.buttonMobile],
  ["--cs-size-content-max", tokens.size.contentMax],
  ["--cs-radius-control", tokens.radius.control],
  ["--cs-radius-card", tokens.radius.card],
  ["--cs-focus-ring-width", tokens.focus.ringWidth],
  ["--cs-focus-ring-color", tokens.focus.ringColor],
  ["--cs-focus-ring-offset", tokens.focus.ringOffset],
  ["--cs-motion-step", `${String(tokens.motion.stepMs)}ms`],
  ["--cs-motion-stamp", `${String(tokens.motion.stampMs)}ms`],
  ["--cs-motion-easing", tokens.motion.easing],
  ["--cs-elevation-card", tokens.elevation.card]
];

export function rootCssVariables(): string {
  const body = entries.map(([k, v]) => `  ${k}: ${v};`).join("\n");
  return `:root {\n${body}\n}`;
}
