import { type LocaleCode } from "@claimsahayak/shared-types";

/**
 * Application-SHELL strings only (navigation, banners, placeholders).
 * All claim guidance, questions, and checklist copy live in Rule Packs —
 * never here (V3 §2.2 data/code split).
 */
export interface ShellDictionary {
  readonly skipToContent: string;
  readonly navLearn: string;
  readonly navFix: string;
  readonly navClaims: string;
  readonly navFindHelp: string;
  readonly footerAbout: string;
  readonly footerPrivacy: string;
  readonly footerDisclaimer: string;
  readonly footerRulesReviewed: string;
  readonly languageSwitchLabel: string;
  readonly languageSwitchPending: string;
  readonly offlineBanner: string;
  readonly progressStep: (current: number, total: number) => string;
  readonly homeHeadline: string;
  readonly homeSub: string;
  readonly ctaStart: string;
  readonly ctaFix: string;
  readonly promiseComplete: string;
  readonly promisePrivate: string;
  readonly promiseFree: string;
  readonly placeholderTitlePrefix: string;
  readonly placeholderBody: string;
  readonly notFoundTitle: string;
  readonly notFoundBody: string;
  readonly notFoundCta: string;
  readonly offlineTitle: string;
  readonly offlineBody: string;
}

const en: ShellDictionary = {
  skipToContent: "Skip to main content",
  navLearn: "Learn",
  navFix: "Fix an issue",
  navClaims: "Claims by scheme",
  navFindHelp: "Find help",
  footerAbout: "About",
  footerPrivacy: "Privacy",
  footerDisclaimer: "Disclaimer",
  footerRulesReviewed: "Rules last reviewed",
  languageSwitchLabel: "Language",
  languageSwitchPending: "Hindi arrives with the content milestone",
  offlineBanner:
    "You're offline — everything still works. Your checklist saves to this device.",
  progressStep: (current, total) => `Step ${String(current)} of ${String(total)}`,
  homeHeadline: "Lost a family member?",
  homeSub:
    "We'll help you prepare all the Post Office claim papers — before you visit. Free, private, about 5 minutes.",
  ctaStart: "Start — prepare my claim papers",
  ctaFix: "The Post Office asked me for another document",
  promiseComplete: "Complete",
  promisePrivate: "Private",
  promiseFree: "Free & independent",
  placeholderTitlePrefix: "Coming in a later milestone",
  placeholderBody:
    "This part of ClaimSahayak is scaffolded in Milestone 1 and is implemented in its scheduled milestone from the approved roadmap.",
  notFoundTitle: "Page not found",
  notFoundBody:
    "That page doesn't exist. Nothing is lost — your saved answers stay on this device.",
  notFoundCta: "Go to the home page",
  offlineTitle: "You're offline",
  offlineBody:
    "This page isn't available offline yet. Pages you've already visited keep working."
};

const hi: ShellDictionary = {
  skipToContent: "मुख्य सामग्री पर जाएँ",
  navLearn: "जानकारी",
  navFix: "समस्या सुधारें",
  navClaims: "योजना अनुसार क्लेम",
  navFindHelp: "मदद पाएँ",
  footerAbout: "हमारे बारे में",
  footerPrivacy: "गोपनीयता",
  footerDisclaimer: "अस्वीकरण",
  footerRulesReviewed: "नियम अंतिम बार जाँचे गए",
  languageSwitchLabel: "भाषा",
  languageSwitchPending: "हिंदी सामग्री अगले चरण में आएगी",
  offlineBanner:
    "आप ऑफ़लाइन हैं — सब कुछ काम करता रहेगा। आपकी चेकलिस्ट इसी डिवाइस पर सहेजी जाती है।",
  progressStep: (current, total) => `चरण ${String(current)} / ${String(total)}`,
  homeHeadline: "किसी अपने को खोया है?",
  homeSub:
    "पोस्ट ऑफ़िस जाने से पहले हम क्लेम के सभी कागज़ तैयार करने में मदद करेंगे। निःशुल्क, निजी, लगभग 5 मिनट।",
  ctaStart: "शुरू करें — मेरे क्लेम के कागज़ तैयार करें",
  ctaFix: "पोस्ट ऑफ़िस ने कोई और दस्तावेज़ माँगा है",
  promiseComplete: "संपूर्ण",
  promisePrivate: "निजी",
  promiseFree: "निःशुल्क व स्वतंत्र",
  placeholderTitlePrefix: "आगामी चरण में",
  placeholderBody:
    "ClaimSahayak का यह भाग माइलस्टोन 1 में तैयार ढाँचा है और स्वीकृत रोडमैप के निर्धारित माइलस्टोन में लागू होगा।",
  notFoundTitle: "पृष्ठ नहीं मिला",
  notFoundBody:
    "यह पृष्ठ मौजूद नहीं है। चिंता न करें — आपके सहेजे गए उत्तर इसी डिवाइस पर सुरक्षित हैं।",
  notFoundCta: "मुख पृष्ठ पर जाएँ",
  offlineTitle: "आप ऑफ़लाइन हैं",
  offlineBody:
    "यह पृष्ठ अभी ऑफ़लाइन उपलब्ध नहीं है। पहले देखे गए पृष्ठ काम करते रहेंगे।"
};

const dictionaries: Record<LocaleCode, ShellDictionary> = { en, hi };

export function getShellDictionary(locale: LocaleCode): ShellDictionary {
  return dictionaries[locale];
}
