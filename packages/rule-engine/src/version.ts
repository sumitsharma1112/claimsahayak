/**
 * Engine semantic version, stamped into every ChecklistJson and PDF footer
 * (invariant I-1: any checklist ever produced is reproducible from
 * rulePackVersion + engineVersion).
 *
 * Left at its Milestone 1 value here deliberately: this package's own
 * `test/version.test.ts` (a Milestone 1 deliverable, not to be
 * regenerated) asserts exact `satisfiesEngineMin` results computed
 * against this literal string, so changing it would silently break that
 * pre-existing test. Milestone 3 lands real evaluation without needing a
 * version bump — nothing here depends on the number itself being "1.x".
 */
export const ENGINE_VERSION = "0.1.0";

/**
 * Returns true when this engine may load a pack that requires `engineMin`
 * (major.minor comparison per V3 §2.3 meta.engineMin).
 */
export function satisfiesEngineMin(engineMin: string): boolean {
  const parse = (v: string): readonly [number, number] => {
    const [majorRaw = "0", minorRaw = "0"] = v.split(".");
    const major = Number.parseInt(majorRaw, 10);
    const minor = Number.parseInt(minorRaw, 10);
    if (Number.isNaN(major) || Number.isNaN(minor)) {
      throw new Error(`Invalid engine version string: "${v}"`);
    }
    return [major, minor];
  };
  const [reqMajor, reqMinor] = parse(engineMin);
  const [curMajor, curMinor] = parse(ENGINE_VERSION);
  if (curMajor !== reqMajor) {
    return curMajor > reqMajor;
  }
  return curMinor >= reqMinor;
}
