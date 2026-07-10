import type { Config } from "tailwindcss";
import { tokens } from "./tokens.js";

/**
 * Tailwind preset — the ONLY bridge from tokens to utility classes.
 * Apps must not define colors, fonts, sizes, or motion locally; every
 * utility below is derived from the typed token source (Blueprint v2 §5).
 */
export const claimsahayakPreset = {
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      paper: tokens.color.paper,
      ink: { DEFAULT: tokens.color.ink, soft: tokens.color.inkSoft },
      peacock: {
        DEFAULT: tokens.color.peacock,
        deep: tokens.color.peacockDeep,
      },
      stamp: tokens.color.stamp,
      pause: { DEFAULT: tokens.color.pauseAmber, bg: tokens.color.pauseAmberBg },
      notice: {
        DEFAULT: tokens.color.noticeBlue,
        bg: tokens.color.noticeBlueBg,
      },
      ok: { DEFAULT: tokens.color.okGreen, bg: tokens.color.okGreenBg },
      warn: { DEFAULT: tokens.color.warnRed, bg: tokens.color.warnRedBg },
      white: tokens.color.onPeacock,
    },
    fontFamily: {
      display: tokens.font.display.split(",").map((f) => f.trim()),
      body: tokens.font.body.split(",").map((f) => f.trim()),
    },
    fontSize: {
      min: [tokens.fontSize.min, { lineHeight: "1.5" }],
      body: [tokens.fontSize.body, { lineHeight: tokens.fontSize.bodyLine }],
      question: [
        tokens.fontSize.question,
        { lineHeight: tokens.fontSize.questionLine },
      ],
      h1: [tokens.fontSize.h1, { lineHeight: tokens.fontSize.h1Line }],
    },
    screens: {
      /** Single real breakpoint above mobile (Blueprint v2 R-25). */
      desktop: tokens.breakpoint.desktopMin,
    },
    extend: {
      spacing: {
        s1: tokens.space.s1,
        s2: tokens.space.s2,
        s3: tokens.space.s3,
        s4: tokens.space.s4,
        s5: tokens.space.s5,
        s6: tokens.space.s6,
        s7: tokens.space.s7,
        s8: tokens.space.s8,
      },
      maxWidth: { content: tokens.size.contentMax },
      width: { rail: tokens.size.sidebar },
      minHeight: {
        touch: tokens.size.touchTarget,
        button: tokens.size.buttonMobile,
      },
      borderRadius: {
        control: tokens.radius.control,
        card: tokens.radius.card,
        chip: tokens.radius.chip,
      },
      borderWidth: { card: tokens.size.cardBorder },
      height: { progress: tokens.size.progressBar },
      transitionDuration: {
        step: `${String(tokens.motion.stepMs)}ms`,
        stamp: `${String(tokens.motion.stampMs)}ms`,
      },
      transitionTimingFunction: { token: tokens.motion.easing },
      boxShadow: { card: tokens.elevation.card },
      ringWidth: { focus: tokens.focus.ringWidth },
      ringColor: { focus: tokens.focus.ringColor },
      ringOffsetWidth: { focus: tokens.focus.ringOffset },
    },
  },
} satisfies Partial<Config>;
