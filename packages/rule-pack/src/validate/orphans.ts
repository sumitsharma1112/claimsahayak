import type { OutputRule, RulePack } from "@claimsahayak/shared-types";
import { issue, type ValidationIssue } from "../schema/issue.js";
import { OFFICE_DOCUMENT_TEMPLATES } from "../data/office-documents.js";
import { DECLARATION_TEMPLATES } from "../data/declarations.js";

/**
 * Milestone 7's office-facing composed documents (forwarding letter,
 * approval note, office note, witness sheet) are always available in the
 * Claim Package view for every payable decision — they are never gated
 * behind a specific route/card the way a claimant-facing letter template
 * is, so they have no `OutputRule`/`CardDefinition` reference to find.
 * Milestone 10's Rule-Book-sourced declarations (declarations.ts) are
 * likewise never referenced via `OutputRule.refId` — they're selected
 * conditionally in `apps/web`'s `ClaimPackage.tsx` by checking the
 * account's own already-Rule-Engine-selected document requirements (see
 * declarations.ts's header for why), not by an output/card reference.
 * Both groups are treated as reachable-by-design here rather than
 * fabricating a fake output/card reference just to satisfy this check.
 */
const ALWAYS_AVAILABLE_TEMPLATE_IDS = new Set([
  ...OFFICE_DOCUMENT_TEMPLATES.map((t) => t.id),
  ...DECLARATION_TEMPLATES.map((t) => t.id),
]);

/** All OutputRule instances in the pack — route outputs AND overlay items. */
function allOutputs(pack: RulePack): readonly OutputRule[] {
  return [...pack.outputs, ...pack.overlays.flatMap((o) => o.items)];
}

/** Every refId on a form/document-typed output must resolve to a real entry. */
export function checkRefIdsResolve(pack: RulePack): readonly ValidationIssue[] {
  const documentIds = new Set(pack.documents.map((d) => d.id));
  const formIds = new Set(pack.forms.map((f) => f.id));
  const templateIds = new Set(pack.templates.map((t) => t.id));
  const issues: ValidationIssue[] = [];

  allOutputs(pack).forEach((o, i) => {
    if (o.refId === undefined) {
      return;
    }
    const resolvesSomewhere =
      documentIds.has(o.refId) || formIds.has(o.refId) || templateIds.has(o.refId);
    if (!resolvesSomewhere) {
      issues.push(
        issue(
          `outputs/overlays[${String(i)}](${o.id}).refId`,
          `refId "${o.refId}" does not match any documents[]/forms[]/templates[] id`,
        ),
      );
    }
  });

  pack.cards.forEach((c, i) => {
    if (c.templateId !== undefined && !templateIds.has(c.templateId)) {
      issues.push(
        issue(
          `cards[${String(i)}](${c.id}).templateId`,
          `templateId "${c.templateId}" does not match any templates[] id`,
        ),
      );
    }
  });

  return issues;
}

/** Every document must be used by at least one output somewhere in the pack. */
export function checkNoOrphanDocuments(pack: RulePack): readonly ValidationIssue[] {
  const referenced = new Set(
    allOutputs(pack)
      .map((o) => o.refId)
      .filter((id): id is string => id !== undefined),
  );
  const issues: ValidationIssue[] = [];
  pack.documents.forEach((doc, i) => {
    if (!referenced.has(doc.id)) {
      issues.push(
        issue(`documents[${String(i)}]`, `document "${doc.id}" is never referenced by any output`),
      );
    }
  });
  return issues;
}

/** Every form must be used by at least one output somewhere in the pack. */
export function checkNoOrphanForms(pack: RulePack): readonly ValidationIssue[] {
  const referenced = new Set(
    allOutputs(pack)
      .map((o) => o.refId)
      .filter((id): id is string => id !== undefined),
  );
  const issues: ValidationIssue[] = [];
  pack.forms.forEach((form, i) => {
    if (!referenced.has(form.id)) {
      issues.push(
        issue(`forms[${String(i)}]`, `form "${form.id}" is never referenced by any output`),
      );
    }
  });
  return issues;
}

/** Every template must be used by an output OR a card. */
export function checkNoOrphanTemplates(pack: RulePack): readonly ValidationIssue[] {
  const referencedByOutputs = new Set(
    allOutputs(pack)
      .map((o) => o.refId)
      .filter((id): id is string => id !== undefined),
  );
  const referencedByCards = new Set(
    pack.cards.map((c) => c.templateId).filter((id): id is string => id !== undefined),
  );
  const issues: ValidationIssue[] = [];
  pack.templates.forEach((template, i) => {
    if (
      !referencedByOutputs.has(template.id) &&
      !referencedByCards.has(template.id) &&
      !ALWAYS_AVAILABLE_TEMPLATE_IDS.has(template.id)
    ) {
      issues.push(
        issue(
          `templates[${String(i)}]`,
          `template "${template.id}" is never referenced by any output or card`,
        ),
      );
    }
  });
  return issues;
}

/** Every card must be the target of at least one card-kind route. */
export function checkNoOrphanCards(pack: RulePack): readonly ValidationIssue[] {
  const referenced = new Set(pack.routes.filter((r) => r.kind === "card").map((r) => r.target));
  const issues: ValidationIssue[] = [];
  pack.cards.forEach((card, i) => {
    if (!referenced.has(card.id)) {
      issues.push(
        issue(`cards[${String(i)}]`, `card "${card.id}" is never the target of a card-kind route`),
      );
    }
  });
  return issues;
}

/** Every overlay's fixSlug must resolve to a real fix-tier content page. */
export function checkFixSlugsResolve(pack: RulePack): readonly ValidationIssue[] {
  const fixSlugs = new Set(pack.content.filter((c) => c.tier === "fix").map((c) => c.slug));
  const issues: ValidationIssue[] = [];
  pack.overlays.forEach((overlay, i) => {
    if (!fixSlugs.has(overlay.fixSlug)) {
      issues.push(
        issue(
          `overlays[${String(i)}](${overlay.flagId}).fixSlug`,
          `fixSlug "${overlay.fixSlug}" does not match any content[] entry with tier "fix"`,
        ),
      );
    }
  });
  return issues;
}
