import { type LocaleCode } from "@claimsahayak/shared-types";

/**
 * Wizard-SHELL strings only — UI chrome around the Rule-Pack-driven
 * question (continue button, why-toggle, generic yes/no affordance for a
 * boolean question, debug panel labels). Question text, why-strip copy,
 * and option labels all come from the Rule Pack itself; never duplicated
 * here (same data/code split as i18n/shell.ts).
 */
export interface WizardDictionary {
  readonly continueLabel: string;
  readonly whyToggleLabel: string;
  readonly yesLabel: string;
  readonly noLabel: string;
  readonly monthLabel: string;
  readonly yearLabel: string;
  readonly monthYearPlaceholder: string;
  readonly loadingLabel: string;
  readonly resumeBannerTitle: string;
  readonly resumeBannerBody: string;
  readonly resumeBannerAction: string;
  readonly debugPanelTitle: string;
  readonly debugRulePackVersion: string;
  readonly debugEngineVersion: string;
  readonly debugCurrentQuestion: string;
  readonly debugLocale: string;
  readonly debugAnswers: string;
  readonly debugVisibleQuestions: string;
  readonly foundationCompleteTitle: string;
  readonly foundationCompleteBody: string;
}

const en: WizardDictionary = {
  continueLabel: "Continue",
  whyToggleLabel: "Why we ask",
  yesLabel: "Yes",
  noLabel: "No",
  monthLabel: "Month",
  yearLabel: "Year",
  monthYearPlaceholder: "Select",
  loadingLabel: "Loading your checklist…",
  resumeBannerTitle: "Welcome back",
  resumeBannerBody: "You have answers saved on this device from before.",
  resumeBannerAction: "Continue where you left off",
  debugPanelTitle: "Debug panel (development only)",
  debugRulePackVersion: "Rule Pack version",
  debugEngineVersion: "Engine version",
  debugCurrentQuestion: "Current question",
  debugLocale: "Locale",
  debugAnswers: "Current answers",
  debugVisibleQuestions: "Currently visible questions",
  foundationCompleteTitle: "Foundation preview complete",
  foundationCompleteBody:
    "Every currently-visible question has an answer. The full wizard flow (navigation, resume, and the result checklist) ships in its own scheduled milestone.",
};

const hi: WizardDictionary = {
  continueLabel: "जारी रखें",
  whyToggleLabel: "हम यह क्यों पूछते हैं",
  yesLabel: "हाँ",
  noLabel: "नहीं",
  monthLabel: "महीना",
  yearLabel: "वर्ष",
  monthYearPlaceholder: "चुनें",
  loadingLabel: "आपकी चेकलिस्ट लोड हो रही है…",
  resumeBannerTitle: "वापसी पर स्वागत है",
  resumeBannerBody: "इस डिवाइस पर आपके पहले के सहेजे गए उत्तर मौजूद हैं।",
  resumeBannerAction: "जहाँ छोड़ा था वहीं से जारी रखें",
  debugPanelTitle: "डीबग पैनल (केवल डेवलपमेंट में)",
  debugRulePackVersion: "रूल पैक संस्करण",
  debugEngineVersion: "इंजन संस्करण",
  debugCurrentQuestion: "वर्तमान प्रश्न",
  debugLocale: "भाषा",
  debugAnswers: "वर्तमान उत्तर",
  debugVisibleQuestions: "अभी दिखने वाले प्रश्न",
  foundationCompleteTitle: "फ़ाउंडेशन पूर्वावलोकन पूर्ण",
  foundationCompleteBody:
    "अभी दिखने वाले हर प्रश्न का उत्तर दिया जा चुका है। पूरा विज़ार्ड प्रवाह (नेविगेशन, फिर से शुरू करना, और अंतिम चेकलिस्ट) अपने निर्धारित माइलस्टोन में आएगा।",
};

const dictionaries: Record<LocaleCode, WizardDictionary> = { en, hi };

export function getWizardDictionary(locale: LocaleCode): WizardDictionary {
  return dictionaries[locale];
}
