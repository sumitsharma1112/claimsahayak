import { getShellDictionary } from "@/i18n/shell";
import { DEFAULT_LOCALE } from "@claimsahayak/shared-config";

/**
 * Wizard progress component — presentation only (M1 scaffold). The wizard
 * (M4) supplies current/total; the branch-aware "Y" calculation belongs to
 * the engine-driven step model, never to this component.
 * Spec: "Step X of Y" text + 3px bar; Y never visibly decreases mid-step.
 */
export function ProgressBar({
  current,
  total
}: {
  readonly current: number;
  readonly total: number;
}) {
  const t = getShellDictionary(DEFAULT_LOCALE);
  const safeTotal = Math.max(total, 1);
  const clamped = Math.min(Math.max(current, 0), safeTotal);
  const percent = Math.round((clamped / safeTotal) * 100);
  return (
    <div>
      <p className="mb-s2 mt-0 text-[16px] text-ink-soft">
        {t.progressStep(clamped, safeTotal)}
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={safeTotal}
        aria-valuenow={clamped}
        aria-label={t.progressStep(clamped, safeTotal)}
        className="h-[3px] w-full rounded-chip bg-ink-soft/20"
      >
        <div
          className="h-full rounded-chip bg-peacock transition-[width] duration-step"
          style={{ width: `${String(percent)}%` }}
        />
      </div>
    </div>
  );
}
