/**
 * Cache-Utilities für EduFunds
 * 
 * Funktionen:
 * - Lokales Caching mit localStorage
 * - Cache-Versionierung
 * - Automatische Cache-Invalidierung nach TTL
 * - Fallback auf Cache wenn Offline
 */

// Cache-Konfiguration
const CACHE_CONFIG = {
  VERSION: '1.0.0', // Bei Datenstruktur-Änderungen erhöhen
  DEFAULT_TTL_HOURS: 24,
  PREFIX: 'edufunds_',
  MAX_CACHE_SIZE: 5 * 1024 * 1024, // 5MB Limit
};

// Cache-Eintrag Interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
  ttl: number; // in Millisekunden
}

// Cache-Statistiken
interface CacheStats {
  totalEntries: number;
  totalSize: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

/**
 * Prüft ob localStorage verfügbar ist (Client-Side)
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Generiert einen Cache-Key mit Präfix
 */
function generateKey(key: string): string {
  return `${CACHE_CONFIG.PREFIX}${key}`;
}

/**
 * Speichert Daten im Cache
 * @param key - Cache-Key
 * @param data - Zu speichernde Daten
 * @param ttlHours - Time-to-Live in Stunden (optional, default: 24)
 */
export function setCachedData<T>(
  key: string,
  data: T,
  ttlHours: number = CACHE_CONFIG.DEFAULT_TTL_HOURS
): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('[Cache] localStorage nicht verfügbar');
    return false;
  }

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_CONFIG.VERSION,
      ttl: ttlHours * 60 * 60 * 1000, // Umrechnung in Millisekunden
    };

    const serialized = JSON.stringify(entry);
    
    // Prüfe auf Größenlimit
    if (serialized.length > CACHE_CONFIG.MAX_CACHE_SIZE) {
      console.warn('[Cache] Daten zu groß für Cache');
      return false;
    }

    window.localStorage.setItem(generateKey(key), serialized);
    return true;
  } catch (error) {
    console.error('[Cache] Fehler beim Speichern:', error);
    // Bei QuotaExceededError: Alte Einträge löschen
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      cleanupOldCache();
    }
    return false;
  }
}

/**
 * Liest Daten aus dem Cache
 * @param key - Cache-Key
 * @returns Die gecachten Daten oder null
 */
export function getCachedData<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(generateKey(key));
    if (!stored) return null;

    const entry: CacheEntry<T> = JSON.parse(stored);

    // Prüfe Version
    if (entry.version !== CACHE_CONFIG.VERSION) {
      console.log('[Cache] Version mismatch, Cache invalidiert');
      clearCacheKey(key);
      return null;
    }

    // Prüfe ob Cache abgelaufen
    if (Date.now() - entry.timestamp > entry.ttl) {
      console.log('[Cache] Eintrag abgelaufen');
      clearCacheKey(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.error('[Cache] Fehler beim Lesen:', error);
    return null;
  }
}

/**
 * Prüft ob ein Cache-Eintrag gültig ist
 * @param key - Cache-Key
 */
export function isCacheValid(key: string): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    const stored = window.localStorage.getItem(generateKey(key));
    if (!stored) return false;

    const entry: CacheEntry<unknown> = JSON.parse(stored);

    // Prüfe Version
    if (entry.version !== CACHE_CONFIG.VERSION) return false;

    // Prüfe Ablaufzeit
    return Date.now() - entry.timestamp <= entry.ttl;
  } catch {
    return false;
  }
}

/**
 * Löscht einen bestimmten Cache-Eintrag
 * @param key - Cache-Key
 */
export function clearCacheKey(key: string): void {
  if (!isLocalStorageAvailable()) return;

  try {
    window.localStorage.removeItem(generateKey(key));
  } catch (error) {
    console.error('[Cache] Fehler beim Löschen:', error);
  }
}

/**
 * Löscht den gesamten EduFunds-Cache
 */
export function clearCache(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(CACHE_CONFIG.PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      window.localStorage.removeItem(key);
    });

    console.log(`[Cache] ${keysToRemove.length} Einträge gelöscht`);
  } catch (error) {
    console.error('[Cache] Fehler beim Leeren:', error);
  }
}

/**
 * Löscht alte/ablaufende Cache-Einträge
 */
function cleanupOldCache(): void {
  if (!isLocalStorageAvailable()) return;

  try {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key?.startsWith(CACHE_CONFIG.PREFIX)) continue;

      try {
        const stored = window.localStorage.getItem(key);
        if (!stored) continue;

        const entry: CacheEntry<unknown> = JSON.parse(stored);
        
        // Lösche abgelaufene oder falsche Version
        if (entry.version !== CACHE_CONFIG.VERSION ||
            now - entry.timestamp > entry.ttl) {
          keysToRemove.push(key);
        }
      } catch {
        // Ungültige Einträge löschen
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => {
      window.localStorage.removeItem(key);
    });

    if (keysToRemove.length > 0) {
      console.log(`[Cache] ${keysToRemove.length} alte Einträge bereinigt`);
    }
  } catch (error) {
    console.error('[Cache] Fehler bei Bereinigung:', error);
  }
}

/**
 * Holt Daten mit Cache-Strategie
 * Versucht zuerst Cache, dann fetch, dann Cache als Fallback
 * 
 * @param key - Cache-Key
 * @param fetchFn - Funktion zum Laden der Daten
 * @param ttlHours - Cache-TTL in Stunden
 */
export async function fetchWithCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlHours: number = CACHE_CONFIG.DEFAULT_TTL_HOURS
): Promise<T> {
  // 1. Versuche aus Cache zu lesen
  const cached = getCachedData<T>(key);
  if (cached) {
    console.log(`[Cache] Daten aus Cache geladen: ${key}`);
    return cached;
  }

  try {
    // 2. Versuche Daten zu laden
    const data = await fetchFn();
    
    // Speichere im Cache
    setCachedData(key, data, ttlHours);
    console.log(`[Cache] Daten geladen und gecacht: ${key}`);
    
    return data;
  } catch (error) {
    // 3. Bei Fehler: Versuche alten Cache als Fallback
    console.warn(`[Cache] Fetch fehlgeschlagen, versuche Fallback:`, error);
    
    // Prüfe auf alten (abgelaufenen) Cache
    if (isLocalStorageAvailable()) {
      const stored = window.localStorage.getItem(generateKey(key));
      if (stored) {
        try {
          const entry: CacheEntry<T> = JSON.parse(stored);
          console.log(`[Cache] Fallback auf alten Cache: ${key}`);
          return entry.data;
        } catch {
          // Ignoriere Fehler
        }
      }
    }
    
    throw error;
  }
}

/**
 * Prüft ob der Browser online ist
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Holt Cache-Statistiken
 */
export function getCacheStats(): CacheStats {
  if (!isLocalStorageAvailable()) {
    return {
      totalEntries: 0,
      totalSize: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }

  let totalSize = 0;
  let oldestTime: number | null = null;
  let newestTime: number | null = null;
  let entryCount = 0;

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key?.startsWith(CACHE_CONFIG.PREFIX)) continue;

    try {
      const stored = window.localStorage.getItem(key);
      if (!stored) continue;

      totalSize += stored.length * 2; // UTF-16 = 2 Bytes pro Zeichen
      entryCount++;

      const entry: CacheEntry<unknown> = JSON.parse(stored);
      const time = entry.timestamp;

      if (oldestTime === null || time < oldestTime) oldestTime = time;
      if (newestTime === null || time > newestTime) newestTime = time;
    } catch {
      // Ignoriere fehlerhafte Einträge
    }
  }

  return {
    totalEntries: entryCount,
    totalSize,
    oldestEntry: oldestTime ? new Date(oldestTime) : null,
    newestEntry: newestTime ? new Date(newestTime) : null,
  };
}

// Spezifische Cache-Keys für EduFunds
export const CACHE_KEYS = {
  FOERDERPROGRAMME: 'foerderprogramme',
  FOERDERPROGRAMME_TIMESTAMP: 'foerderprogramme_last_update',
  USER_PREFERENCES: 'user_preferences',
  LAST_SEARCH: 'last_search',
  FILTER_SETTINGS: 'filter_settings',
} as const;

// Cache-Hooks für React (falls benötigt)
export function createCacheHook<T>(key: string, ttlHours?: number) {
  return {
    get: () => getCachedData<T>(key),
    set: (data: T) => setCachedData(key, data, ttlHours),
    clear: () => clearCacheKey(key),
    isValid: () => isCacheValid(key),
  };
}
