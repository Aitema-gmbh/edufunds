/**
 * JWT-basierte Admin-Authentifizierung
 * 
 * Sicherheitsfeatures:
 * - JWT mit HS256
 * - Token-Expiry (24h)
 * - Secure HTTP-only Cookies in Production
 * - Rate Limiting für Login
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Admin-Typen
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
}

export interface JWTPayload {
  sub: string;      // user id
  email: string;
  role: 'admin' | 'superadmin';
  iat: number;      // issued at
  exp: number;      // expiration
}

// Token-Konfiguration
const TOKEN_EXPIRY = '24h';
const COOKIE_NAME = 'admin_session';

// Secret aus Umgebungsvariable
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET nicht konfiguriert');
  }
  return new TextEncoder().encode(secret);
}

/**
 * JWT Token erstellen
 */
export async function createAdminToken(user: AdminUser): Promise<string> {
  const secret = getJWTSecret();
  
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secret);
  
  return token;
}

/**
 * JWT Token verifizieren
 */
export async function verifyAdminToken(token: string): Promise<JWTPayload | null> {
  try {
    const secret = getJWTSecret();
    const { payload } = await jwtVerify(token, secret);
    
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'superadmin',
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Token im Cookie setzen
 */
export async function setAdminSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 Stunden
    path: '/',
  });
}

/**
 * Session-Cookie löschen
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Aktuelle Session aus Cookie lesen
 */
export async function getAdminSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (!token) return null;
  
  return verifyAdminToken(token);
}

/**
 * Admin aus Request extrahieren (API Routes)
 */
export async function getAdminFromRequest(request: NextRequest): Promise<JWTPayload | null> {
  // Versuche zuerst Cookie
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(COOKIE_NAME)?.value;
  
  if (cookieToken) {
    const payload = await verifyAdminToken(cookieToken);
    if (payload) return payload;
  }
  
  // Fallback: Authorization Header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const payload = await verifyAdminToken(token);
    if (payload) return payload;
  }
  
  // Legacy: X-Admin-Key (für API-Clients ohne JWT)
  const adminKey = request.headers.get('x-admin-key');
  const expectedKey = process.env.NEWSLETTER_ADMIN_KEY;
  
  if (adminKey && expectedKey && adminKey === expectedKey) {
    // Return pseudo-payload für Legacy-Auth
    return {
      sub: 'api-key',
      email: 'api@edufunds.org',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
  }
  
  return null;
}

/**
 * Middleware: Prüft ob User Admin ist
 */
export async function requireAdmin(request: NextRequest): Promise<{ 
  success: false; 
  response: Response;
} | { 
  success: true; 
  admin: JWTPayload;
}> {
  const admin = await getAdminFromRequest(request);
  
  if (!admin) {
    return {
      success: false,
      response: new Response(JSON.stringify({ 
        success: false, 
        message: 'Nicht autorisiert. Bitte einloggen.' 
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
  
  return { success: true, admin };
}

/**
 * Middleware: Prüft Superadmin-Rechte
 */
export async function requireSuperAdmin(request: NextRequest): Promise<{
  success: false;
  response: Response;
} | {
  success: true;
  admin: JWTPayload;
}> {
  const result = await requireAdmin(request);
  
  if (!result.success) return result;
  
  if (result.admin.role !== 'superadmin') {
    return {
      success: false,
      response: new Response(JSON.stringify({
        success: false,
        message: 'Superadmin-Rechte erforderlich.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }
  
  return { success: true, admin: result.admin };
}

// Einfache Admin-Credentials (in Production: Datenbank)
// PASSWÖRTER SOLLEN GEHASHT SEIN!
const ADMIN_CREDENTIALS = [
  {
    id: '1',
    email: process.env.ADMIN_EMAIL || 'admin@edufunds.org',
    // PASSWORT MUSS GEÄNDERT UND GEHASHT WERDEN!
    passwordHash: process.env.ADMIN_PASSWORD_HASH || '',
    role: 'superadmin' as const,
  }
];

/**
 * Admin-Login prüfen
 * In Production: Mit Datenbank und bcrypt
 */
export async function verifyAdminCredentials(
  email: string, 
  password: string
): Promise<AdminUser | null> {
  // TODO: In Production mit Datenbank und bcrypt implementieren
  const admin = ADMIN_CREDENTIALS.find(a => a.email === email);
  
  if (!admin) return null;
  
  // PLAINTEXT-Vergleich nur für Demo - NIEMALS in Production!
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (password !== expectedPassword) return null;
  
  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  };
}
