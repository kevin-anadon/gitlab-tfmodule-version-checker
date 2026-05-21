const cache = new Map<string, { version: string; timestamp: number }>();

const TTL = 5 * 60 * 1000;

export function getCached(key: string): string | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > TTL) {
    cache.delete(key);
    return null;
  }

  return entry.version;
}

export function setCache(key: string, version: string) {
  cache.set(key, {
    version,
    timestamp: Date.now()
  });
}