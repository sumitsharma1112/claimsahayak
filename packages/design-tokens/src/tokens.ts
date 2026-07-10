/**
 * ClaimSahayak design tokens — exact values from Blueprint v2 §5.2–§5.5.
 * No color, size, or motion value may be defined anywhere else.
 * The palette deliberately avoids India Post red/yellow (brand guardrail).
 */

export const color = {
  /** App background. */
  paper: "#F6F4EE",
  /** Primary text. */
  ink: "#22313A",
  /** Secondary text. */
  inkSoft: "#56646D",
  /** Primary actions, links, focus ring. */
  peacock: "#14555A",
  /** Pressed / hover. */
  peacockDeep: "#0C3C40",
  /** Stamp-check motif only (muted seal purple). */
  stamp: "#7A4A6F",
  /** Pause cards. */
  pauseAmber: "#8E5F15",
  pauseAmberBg: "#FBF3E4",
  /** Stop / court cards, info. */
  noticeBlue: "#2C5E8A",
  noticeBlueBg: "#EDF3F9",
  /** Success / complete. */
  okGreen: "#2E6B4F",
  okGreenBg: "#EBF4EF",
  /** Destructive / critical warnings only (rare). */
  warnRed: "#A4383A",
  warnRedBg: "#FBEDED",
  /** On-primary text. */
  onPeacock: "#FFFFFF"
} as const;

export const font = {
  /** Display face — page titles and the wizard question only (Latin). */
  display:
    '"Bricolage Grotesque", "Noto Sans Devanagari", "Noto Sans", system-ui, sans-serif',
  /** Body across scripts — one family keeps rhythm (v2 §5.3). */
  body: '"Noto Sans", "Noto Sans Devanagari", system-ui, sans-serif',
  /** Tabular numerals in tables and money. */
  numericFeature: "tabular-nums"
} as const;

export const fontSize = {
  /** Minimum anywhere. */
  min: "16px",
  /** Body 18/28 on mobile. */
  body: "18px",
  bodyLine: "28px",
  /** Wizard question lead. */
  question: "22px",
  questionLine: "30px",
  /** H1 28/34. */
  h1: "28px",
  h1Line: "34px",
  /** Large-text toggle base. */
  bodyLarge: "20px"
} as const;

export const space = {
  /** 4px baseline scale. */
  s1: "4px",
  s2: "8px",
  s3: "12px",
  s4: "16px",
  s5: "24px",
  s6: "32px",
  s7: "48px",
  s8: "64px"
} as const;

export const radius = {
  /** Buttons and option cards. */
  control: "12px",
  card: "16px",
  chip: "999px"
} as const;

export const size = {
  /** Minimum touch target (WCAG / v2 §5.4). */
  touchTarget: "48px",
  /** Primary button height on mobile. */
  buttonMobile: "56px",
  /** Content measure. */
  contentMax: "640px",
  sidebar: "320px",
  /** Option-card border. */
  cardBorder: "1.5px",
  /** Progress bar thickness. */
  progressBar: "3px"
} as const;

export const elevation = {
  /** The papery UI stays flat; one soft shadow level for raised cards. */
  card: "0 1px 2px rgba(34, 49, 58, 0.08), 0 2px 8px rgba(34, 49, 58, 0.06)",
  none: "none"
} as const;

export const breakpoint = {
  /** Mobile-first; tablet renders mobile layout centered (v2 R-25). */
  mobileMax: "640px",
  desktopMin: "1024px"
} as const;

export const motion = {
  /** Step transitions. */
  stepMs: 150,
  /** The single stamp-check animation on the result page. */
  stampMs: 400,
  easing: "cubic-bezier(0.2, 0, 0, 1)"
} as const;

export const focus = {
  /** Visible 3px peacock ring (v2 §5.7). */
  ringWidth: "3px",
  ringColor: color.peacock,
  ringOffset: "2px"
} as const;

/**
 * Text/background pairs that must meet WCAG AA (≥ 4.5:1).
 * Verified by an automated contrast test in this package.
 */
export const contrastPairs: ReadonlyArray<{
  readonly name: string;
  readonly fg: string;
  readonly bg: string;
}> = [
  { name: "ink on paper", fg: color.ink, bg: color.paper },
  { name: "ink-soft on paper", fg: color.inkSoft, bg: color.paper },
  { name: "peacock on paper", fg: color.peacock, bg: color.paper },
  { name: "white on peacock", fg: color.onPeacock, bg: color.peacock },
  { name: "white on peacock-deep", fg: color.onPeacock, bg: color.peacockDeep },
  { name: "pause text on pause bg", fg: color.pauseAmber, bg: color.pauseAmberBg },
  { name: "notice text on notice bg", fg: color.noticeBlue, bg: color.noticeBlueBg },
  { name: "ok text on ok bg", fg: color.okGreen, bg: color.okGreenBg },
  { name: "warn text on warn bg", fg: color.warnRed, bg: color.warnRedBg },
  { name: "ink on notice bg", fg: color.ink, bg: color.noticeBlueBg },
  { name: "ink on pause bg", fg: color.ink, bg: color.pauseAmberBg }
];

export const tokens = {
  color,
  font,
  fontSize,
  space,
  radius,
  size,
  elevation,
  breakpoint,
  motion,
  focus
} as const;

export type Tokens = typeof tokens;
