/** Failed chunk promises may also be cached by the production module runtime. */
export function screenFailureNeedsReload(error: unknown): boolean {
  let current = error;
  const seen = new Set<unknown>();
  try {
    while (current && typeof current === 'object' && !seen.has(current)) {
      seen.add(current);
      const record = current as { name?: unknown; message?: unknown; cause?: unknown };
      if (record.name === 'ChunkLoadError') return true;
      if (typeof record.message === 'string' && /Failed to load chunk|Loading chunk [\s\S]* failed|Failed to fetch dynamically imported module|Importing a module script failed/i.test(record.message)) return true;
      current = record.cause;
    }
  } catch {
    // Even an unusual thrown object must not break the error recovery screen.
    return false;
  }
  return false;
}
