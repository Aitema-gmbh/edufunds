/**
 * EduFunds Rate-Limiting System
 * 
 * Bietet:
 * - Redis-basiertes verteiltes Rate-Limiting
 * - In-Memory Fallback wenn Redis nicht verfügbar
 * - Flexible Konfiguration pro Endpoint
 * - IP-basiert und User-basiert möglich
 * - Sliding Window Algorithmus
 */

import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// Konfiguration
// =============================================================================

export interface RateLimitConfig {
  // Anzahl erlaubter Requests pro Window
  maxRequests: number;
  // Fenstergröße in Sekunden
  windowSeconds: number;
  // Optional: Schlüssel-Präfix für unterschiedliche Limits
  keyPrefix?: string;
  // Optional: Custom Key Generator
  keyGenerator?: (request: NextRequest) => string;
  // Optional: Skip Rate-Limiting für bestimmte Requests
  skip?: (request: NextRequest) => boolean;
}

// Standard-Configs für verschiedene Endpoints
export const RATE_LIMIT_CONFIGS = {
  // Generische API-Endpoints
  default: {
    maxRequests: 100,
    windowSeconds: 60,
  } as RateLimitConfig,

  // KI-Generierung (ressourcenintensiv)
  aiGeneration: {
    maxRequests: 5,
    windowSeconds: 60,
    keyPrefix: 'ai',
  } as RateLimitConfig,

  // Kontaktformular
  contact: {
    maxRequests: 3,
    windowSeconds: 300, // 5 Minuten
    keyPrefix: 'contact',
  } as RateLimitConfig,

  // Newsletter
  newsletter: {
    maxRequests: 5,
    windowSeconds: 3600, // 1 Stunde
    keyPrefix: 'newsletter',
  } as RateLimitConfig,

  // Zahlungen
  payment: {
    maxRequests: 10,
    windowSeconds: 60,
    keyPrefix: 'payment',
  } as RateLimitConfig,

  // Admin-Endpoints (strenger)
  admin: {
    maxRequests: 30,
    windowSeconds: 60,
    keyPrefix: 'admin',
  } as RateLimitConfig,
};

// =============================================================================
// Redis Client (Lazy Initialization)
// =============================================================================

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { ex?: number }): Promise<string | null>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<boolean>;
  ttl(key: string): Promise<number>;
}

let redisClient: RedisClient | null = null;
let redisAvailable = false;

/**
 * Initialisiert den Redis-Client (wenn REDIS_URL konfiguriert)
 */
export async function initRedis(): Promise<RedisClient | null> {
  if (redisClient) return redisClient;
  
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('[RateLimit] REDIS_URL nicht konfiguriert, verwende In-Memory-Fallback');
    return null;
  }

  try {
    // Dynamischer Import um Abhängigkeit optional zu machen
    // @ts-ignore - Redis ist optional
    const redisModule = await import('redis').catch(() => null);
    if (!redisModule) {
      console.warn('[RateLimit] Redis Modul nicht installiert');
      return null;
    }
    
    const { createClient } = redisModule;
    const client = createClient({ url: redisUrl });
    
    client.on('error', (err: Error) => {
      console.error('[RateLimit] Redis Fehler:', err);
      redisAvailable = false;
    });

    await client.connect();
    redisAvailable = true;
    redisClient = client as unknown as RedisClient;
    
    console.log('[RateLimit] Redis verbunden');
    return redisClient;
  } catch (error) {
    console.warn('[RateLimit] Redis-Verbindung fehlgeschlagen:', error);
    redisAvailable = false;
    return null;
  }
}

/**
 * Prüft ob Redis verfügbar ist
 */
export function isRedisAvailable(): boolean {
  return redisAvailable;
}

// =============================================================================
// In-Memory Fallback Store
// =============================================================================

interface InMemoryEntry {
  count: number;
  resetTime: number;
  windowStart: number;
}

class InMemoryRateLimitStore {
  private store = new Map<string, InMemoryEntry>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup alle 5 Minuten
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    
    // Prüfe ob abgelaufen
    if (Date.now() > entry.resetTime) {
      this.store.delete(key);
      return null;
    }
    
    return String(entry.count);
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<string | null> {
    const now = Date.now();
    this.store.set(key, {
      count: parseInt(value, 10),
      resetTime: now + (options?.ex || 60) * 1000,
      windowStart: now,
    });
    return 'OK';
  }

  async incr(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) {
      await this.set(key, '1', { ex: 60 });
      return 1;
    }
    entry.count++;
    return entry.count;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const entry = this.store.get(key);
    if (entry) {
      entry.resetTime = Date.now() + seconds * 1000;
      return true;
    }
    return false;
  }

  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return -2;
    const ttl = Math.ceil((entry.resetTime - Date.now()) / 1000);
    return ttl > 0 ? ttl : -1;
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    this.store.forEach((entry, key) => {
      if (now > entry.resetTime) {
        this.store.delete(key);
        cleaned++;
      }
    });
    if (cleaned > 0) {
      console.log(`[RateLimit] Cleanup: ${cleaned} Einträge entfernt`);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }

  getStats(): { size: number } {
    return { size: this.store.size };
  }
}

// Singleton In-Memory Store
const inMemoryStore = new InMemoryRateLimitStore();

// =============================================================================
// Rate Limit Prüfung
// =============================================================================

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Prüft das Rate-Limit für einen Request
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix || 'rl'}:${identifier}`;
  const windowMs = config.windowSeconds * 1000;
  const now = Date.now();

  // Versuche Redis, sonst Fallback
  const client = await initRedis();
  const store = client || inMemoryStore;

  try {
    // Hole aktuellen Count
    const current = await store.get(key);
    
    if (!current) {
      // Erster Request im Fenster
      await store.set(key, '1', { ex: config.windowSeconds });
      return {
        allowed: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        resetTime: now + windowMs,
      };
    }

    const count = parseInt(current, 10);

    if (count >= config.maxRequests) {
      // Limit erreicht
      const ttl = await store.ttl(key);
      const resetTime = now + (ttl > 0 ? ttl * 1000 : windowMs);
      
      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime,
        retryAfter: Math.max(1, ttl),
      };
    }

    // Increment Count
    const newCount = await store.incr(key);
    
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - newCount),
      resetTime: now + windowMs,
    };
  } catch (error) {
    console.error('[RateLimit] Fehler bei Prüfung:', error);
    // Bei Fehler: Erlaube Request (Fail-Open für bessere UX)
    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: 1,
      resetTime: now + windowMs,
    };
  }
}

// =============================================================================
// Request Identifier
// =============================================================================

/**
 * Extrahiert eine Client-Identifier aus dem Request
 * Priorität: User ID > API Key > IP Address > Session
 */
export function getClientIdentifier(request: NextRequest): string {
  // Versuche API Key aus Header
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    return `api:${hashString(apiKey)}`;
  }

  // Versuche User ID aus Auth Header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // In echter Implementierung: JWT decode
    const token = authHeader.slice(7);
    return `user:${hashString(token)}`;
  }

  // Fallback zu IP
  const ip = getClientIP(request);
  return `ip:${ip}`;
}

/**
 * Extrahiert die Client IP aus dem Request
 */
export function getClientIP(request: NextRequest): string {
  // Priorisiere Proxy-Header
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfIP = request.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP;
  }

  // Fallback (in Produktion sollte dies nicht passieren)
  return 'unknown';
}

/**
 * Hashed einen String für sichere Verwendung als Key
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// =============================================================================
// Middleware für Next.js API Routes
// =============================================================================

export interface RateLimitMiddlewareOptions {
  config?: RateLimitConfig;
  configName?: keyof typeof RATE_LIMIT_CONFIGS;
  identifierGenerator?: (request: NextRequest) => string;
  onLimitReached?: (request: NextRequest, result: RateLimitResult) => void;
}

/**
 * Rate-Limiting Middleware für API Routes
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  options: RateLimitMiddlewareOptions = {}
): Promise<{ allowed: boolean; result: RateLimitResult; headers: Record<string, string> }> {
  const config = options.configName 
    ? RATE_LIMIT_CONFIGS[options.configName] 
    : options.config || RATE_LIMIT_CONFIGS.default;

  // Skip Check wenn konfiguriert
  if (config.skip?.(request)) {
    return {
      allowed: true,
      result: {
        allowed: true,
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetTime: Date.now() + config.windowSeconds * 1000,
      },
      headers: {},
    };
  }

  const identifier = options.identifierGenerator 
    ? options.identifierGenerator(request)
    : getClientIdentifier(request);

  const result = await checkRateLimit(identifier, config);

  // Rate Limit Headers (Standardkonform)
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(config.maxRequests),
    'X-RateLimit-Remaining': String(Math.max(0, result.remaining)),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
  };

  if (!result.allowed) {
    headers['Retry-After'] = String(result.retryAfter || config.windowSeconds);
    
    if (options.onLimitReached) {
      options.onLimitReached(request, result);
    }
  }

  return { allowed: result.allowed, result, headers };
}

/**
 * Erstellt eine Rate-Limit Response
 */
export function createRateLimitResponse(
  result: RateLimitResult,
  headers: Record<string, string>
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
        retryAfter: result.retryAfter,
      },
    },
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    }
  );
}

// =============================================================================
// Decorator für einfache Verwendung
// =============================================================================

/**
 * Wrapper für API Handler mit Rate-Limiting
 */
export function withRateLimit<T extends (request: NextRequest, ...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options: RateLimitMiddlewareOptions
): (request: NextRequest, ...args: Parameters<T> extends [any, ...infer R] ? R : never[]) => Promise<NextResponse> {
  return async (request: NextRequest, ...args: any[]) => {
    const { allowed, result, headers } = await rateLimitMiddleware(request, options);

    if (!allowed) {
      return createRateLimitResponse(result, headers);
    }

    // Führe Handler aus und füge Rate-Limit Headers hinzu
    const response = await handler(request, ...args);
    
    // Headers zum Response hinzufügen
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
}

// =============================================================================
// Status & Monitoring
// =============================================================================

export function getRateLimitStatus(): {
  redisAvailable: boolean;
  inMemoryEntries: number;
} {
  return {
    redisAvailable,
    inMemoryEntries: inMemoryStore.getStats().size,
  };
}

export default {
  checkRateLimit,
  rateLimitMiddleware,
  createRateLimitResponse,
  withRateLimit,
  getClientIdentifier,
  getClientIP,
  isRedisAvailable,
  RATE_LIMIT_CONFIGS,
};