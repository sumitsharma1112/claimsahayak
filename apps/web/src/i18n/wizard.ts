import { type CardKind, type LocaleCode } from "@claimsahayak/shared-types";

/**
 * Wizard-SHELL strings only — UI chrome around the Rule-Pack-driven
 * question (continue button, why-toggle, generic yes/no affordance for a
 * boolean question, debug panel labels). Question text, why-strip copy,
 * and option labels all come from the Rule Pack itself; never duplicated
 * here (same data/code split as i18n/shell.ts).
 */
export interface WizardDictionary {
  readonly pageTitle: string;
  readonly continueLabel: string;
  readonly previousLabel: string;
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
  readonly resumeBannerStartNewAction: string;
  readonly resumeBannerClearAction: string;
  readonly startOverLabel: string;
  readonly startOverConfirmTitle: string;
  readonly startOverConfirmBody: string;
  readonly startOverConfirmAction: string;
  readonly startOverCancelAction: string;
  readonly printLetterLabel: string;
  readonly cardNextStepLabel: string;
  readonly cardKindLabels: Readonly<Record<CardKind, string>>;
  readonly readAloudLabel: string;
  readonly readAloudStopLabel: string;
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
  pageTitle: "Prepare my claim papers",
  continueLabel: "Continue",
  previousLabel: "Previous",
  whyToggleLabel: "Why we ask",
  yesLabel: "Yes",
  noLabel: "No",
  monthLabel: "Month",
  yearLabel: "Year",
  monthYearPlaceholder: "Select",
  loadingLabel: "Loading your checklist…",
  resumeBannerTitle: "Resume previous claim?",
  resumeBannerBody: "You have answers saved on this device from before.",
  resumeBannerAction: "Resume",
  resumeBannerStartNewAction: "Start New",
  resumeBannerClearAction: "Clear Previous",
  startOverLabel: "Start Over",
  startOverConfirmTitle: "Start over?",
  startOverConfirmBody:
    "This deletes your saved answers from this device. This can't be undone.",
  startOverConfirmAction: "Yes, start over",
  startOverCancelAction: "Cancel",
  printLetterLabel: "Print Letter",
  cardNextStepLabel: "What to do next",
  cardKindLabels: {
    pause: "Pause",
    stop: "Stop",
    wait: "Wait",
    info: "Information",
    dual: "Decision needed",
  },
  readAloudLabel: "Read question aloud",
  readAloudStopLabel: "Stop reading",
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
  pageTitle: "मेरे क्लेम के कागज़ तैयार करें",
  continueLabel: "जारी रखें",
  previousLabel: "पिछला",
  whyToggleLabel: "हम यह क्यों पूछते हैं",
  yesLabel: "हाँ",
  noLabel: "नहीं",
  monthLabel: "महीना",
  yearLabel: "वर्ष",
  monthYearPlaceholder: "चुनें",
  loadingLabel: "आपकी चेकलिस्ट लोड हो रही है…",
  resumeBannerTitle: "क्या पिछला क्लेम फिर से शुरू करें?",
  resumeBannerBody: "इस डिवाइस पर आपके पहले के सहेजे गए उत्तर मौजूद हैं।",
  resumeBannerAction: "फिर से शुरू करें",
  resumeBannerStartNewAction: "नया शुरू करें",
  resumeBannerClearAction: "पिछला हटाएँ",
  startOverLabel: "फिर से शुरू करें",
  startOverConfirmTitle: "क्या फिर से शुरू करें?",
  startOverConfirmBody:
    "इससे इस डिवाइस पर सहेजे गए आपके उत्तर मिट जाएँगे। इसे पूर्ववत नहीं किया जा सकता।",
  startOverConfirmAction: "हाँ, फिर से शुरू करें",
  startOverCancelAction: "रद्द करें",
  printLetterLabel: "पत्र प्रिंट करें",
  cardNextStepLabel: "आगे क्या करें",
  cardKindLabels: {
    pause: "रुकें",
    stop: "रोकें",
    wait: "प्रतीक्षा करें",
    info: "जानकारी",
    dual: "निर्णय आवश्यक",
  },
  readAloudLabel: "प्रश्न ज़ोर से पढ़ें",
  readAloudStopLabel: "पढ़ना रोकें",
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
