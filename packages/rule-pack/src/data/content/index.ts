import type { ContentPage } from "@claimsahayak/shared-types";
import { FIX_PAGES } from "./fix.js";
import { LEARN_PAGES } from "./learn.js";
import { FAQ_PAGES } from "./faq.js";
import { GLOSSARY_PAGES } from "./glossary.js";

export const CONTENT: readonly ContentPage[] = [
  ...FIX_PAGES,
  ...LEARN_PAGES,
  ...FAQ_PAGES,
  ...GLOSSARY_PAGES,
];
