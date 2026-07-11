/**
 * Canonical CS-ID list — the 84 VERIFIED (✅/⚠) rules of the ClaimSahayak
 * Official Rule Book v1.0 (`knowledge-base/official-rule-book/
 * master-rule-matrix.md`, §2 Rule Index). Excludes the 2 🔶
 * PROVISIONAL/UNVERIFIED rules (CS-NOM-024, CS-NOM-025), which are barred
 * from pack data by the Rule Book's own charter and may exist only as
 * NV-register entries (see nv-register.ts, NV-RB-6/7).
 *
 * This is the single source of truth for two things: (1) the
 * `validate/rulebook-provenance.ts` gate, which confirms every
 * `sourceRefs` entry anywhere in the pack is a real CS-ID; (2) the
 * coverage-percentage figure in the integration report (distinct CS-IDs
 * referenced by ≥1 route/output/overlay/question ÷ 84).
 */
export const RULEBOOK_CS_IDS: readonly string[] = [
  // Topic 1 — Nomination (23 verified; 024/025 are provisional, excluded)
  "CS-NOM-001", "CS-NOM-002", "CS-NOM-003", "CS-NOM-004", "CS-NOM-005",
  "CS-NOM-006", "CS-NOM-007", "CS-NOM-008", "CS-NOM-009", "CS-NOM-010",
  "CS-NOM-011", "CS-NOM-012", "CS-NOM-013", "CS-NOM-014", "CS-NOM-015",
  "CS-NOM-016", "CS-NOM-017", "CS-NOM-018", "CS-NOM-019", "CS-NOM-020",
  "CS-NOM-021", "CS-NOM-022", "CS-NOM-023",
  // Topic 2 — No Nomination (11)
  "CS-NON-001", "CS-NON-002", "CS-NON-003", "CS-NON-004", "CS-NON-005",
  "CS-NON-006", "CS-NON-007", "CS-NON-008", "CS-NON-009", "CS-NON-010",
  "CS-NON-011",
  // Topic 3 — Nominee Predeceased (8)
  "CS-PRE-001", "CS-PRE-002", "CS-PRE-003", "CS-PRE-004", "CS-PRE-005",
  "CS-PRE-006", "CS-PRE-007", "CS-PRE-008",
  // Topic 4 — Multiple Nominees (9)
  "CS-MNM-001", "CS-MNM-002", "CS-MNM-003", "CS-MNM-004", "CS-MNM-005",
  "CS-MNM-006", "CS-MNM-007", "CS-MNM-008", "CS-MNM-009",
  // Topic 5 — Minor Nominee (13)
  "CS-MIN-001", "CS-MIN-002", "CS-MIN-003", "CS-MIN-004", "CS-MIN-005",
  "CS-MIN-006", "CS-MIN-007", "CS-MIN-008", "CS-MIN-009", "CS-MIN-010",
  "CS-MIN-011", "CS-MIN-012", "CS-MIN-013",
  // Topic 6 — Joint Accounts & Survivorship (11)
  "CS-JNT-001", "CS-JNT-002", "CS-JNT-003", "CS-JNT-004", "CS-JNT-005",
  "CS-JNT-006", "CS-JNT-007", "CS-JNT-008", "CS-JNT-009", "CS-JNT-010",
  "CS-JNT-011",
  // Topic 7 — Scheme-wise Differences (9)
  "CS-SCH-001", "CS-SCH-002", "CS-SCH-003", "CS-SCH-004", "CS-SCH-005",
  "CS-SCH-006", "CS-SCH-007", "CS-SCH-008", "CS-SCH-009",
];
