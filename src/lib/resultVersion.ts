/** Results published before the September 2026 catalogue and scoring update. */
export const LEGACY_RESULT_VERSION = 2 as const;
export const CURRENT_RESULT_VERSION = 3 as const;
export type ResultVersion = typeof LEGACY_RESULT_VERSION | typeof CURRENT_RESULT_VERSION;

export function parseResultVersion(value: string | null): ResultVersion {
  return value === String(CURRENT_RESULT_VERSION) ? CURRENT_RESULT_VERSION : LEGACY_RESULT_VERSION;
}
