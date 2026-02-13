/**
 * Refactored Contact API Route
 * 
 * Demonstriert die Verwendung von:
 * - Logger-System
 * - Error-Handling
 * - Rate-Limiting
 * - Retry-Logik
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Resend } from 'resend';

// Neue Utilities
import { createLogger, withTiming, logRequest } from '@/lib/logger';
import { APIError, Errors, withRetry, createErrorResponse, createCorsHeaders } from '@/lib/errors';
import { rateLimitMiddleware, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';

// Logger initialisieren
const logger = createLogger('ContactAPI');

// Resend Initialisierung
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const ADMIN_EMAIL = 'office@aitema.de';
const FROM_EMAIL = 'EduFunds <noreply@aitema.de>';

// Zod Schema für Validierung
const contactSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  subject: z.string().min(5, 'Betreff muss mindestens 5 Zeichen lang sein'),
  message: z.string().min(20, 'Nachricht muss mindestens 20 Zeichen lang sein'),
  datenschutz: z.literal(true, {
    errorMap: () => ({ message: 'Sie müssen der Datenschutzerklärung zustimmen' }),
  }),
  website: z.string().optional(), // Honeypot
  timestamp: z.number().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

// CORS Headers
const corsHeaders = createCorsHeaders();

/**
 * POST Handler mit verbessertem Error-Handling und Rate-Limiting
 */
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  const requestLogger = logRequest(request, crypto.randomUUID());
  let rateLimitResult: { allowed: boolean; result?: any; headers?: Record<string, string> } | null = null;
  
  try {
    // 1. Rate-Limiting Check
    rateLimitResult = await rateLimitMiddleware(request, {
      configName: 'contact',
    });

    if (!rateLimitResult.allowed) {
      logger.warn('Rate limit exceeded', {
        ip: request.headers.get('x-forwarded-for'),
        path: '/api/contact',
      });
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
            retryAfter: rateLimitResult.result.retryAfter,
          },
        },
        {
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // 2. Request Body parsen
    let body: unknown;
    try {
      body = await request.json();
    } catch (parseError) {
      throw Errors.validation('Ungültiger JSON-Body');
    }

    // 3. Honeypot Check (Spam-Schutz)
    const { website, ...data } = body as any;
    if (website && website.trim() !== '') {
      logger.warn('Honeypot triggered - possible bot detected', {
        ip: request.headers.get('x-forwarded-for'),
      });
      // Täusche Erfolg vor (Bots erwarten keine Fehler)
      return NextResponse.json(
        { success: true, message: 'Anfrage wird bearbeitet' },
        { headers: corsHeaders }
      );
    }

    // 4. Timestamp Check (Spam-Schutz)
    const timestamp = (body as any).timestamp;
    if (timestamp && Date.now() - timestamp < 3000) {
      throw Errors.validation('Zu schnell abgesendet. Bitte warten Sie einen Moment.');
    }

    // 5. Validierung
    const validationResult = contactSchema.safeParse(data);
    if (!validationResult.success) {
      const fieldErrors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      throw new APIError('VALIDATION_ERROR', 'Validierungsfehler', {
        details: { fields: fieldErrors },
      });
    }

    const formData = validationResult.data;

    // 6. Datenbank-Operation mit Retry
    const contactEntry = await withTiming(
      'saveContact',
      () => withRetry(
        async () => saveContact(formData, request),
        {
          maxRetries: 3,
          initialDelayMs: 500,
          onRetry: (attempt, error) => {
            logger.warn(`DB Retry ${attempt}`, { error: error.message });
          },
        },
        'ContactDB'
      ),
      logger,
      { email: formData.email }
    );

    // 7. E-Mail Versand mit Retry (nicht-blockierend)
    if (resend) {
      sendEmailsWithRetry(formData, contactEntry.id).catch((error) => {
        logger.error('Email sending failed after retries', {}, error);
      });
    } else {
      logger.warn('Resend not configured - emails skipped');
    }

    // 8. Erfolgs-Response
    const duration = Math.round(performance.now() - startTime);
    requestLogger.response('POST', '/api/contact', 200, duration);

    return NextResponse.json(
      {
        success: true,
        message: 'Ihre Nachricht wurde erfolgreich gesendet.',
        data: {
          id: contactEntry.id,
          submittedAt: contactEntry.createdAt,
        },
      },
      {
        headers: {
          ...corsHeaders,
          ...rateLimitResult.headers,
        },
      }
    );

  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    
    // Log Error
    if (error instanceof APIError) {
      logger.warn(`API Error: ${error.code}`, {
        status: error.statusCode,
        duration,
      });
    } else {
      logger.error('Unexpected error', { duration }, error as Error);
    }

    // Return consistent error response
    const errorResponse = createErrorResponse(error, undefined, corsHeaders);
    
    // Add rate limit headers if available
    if (rateLimitResult?.headers) {
      Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });
    }
    
    return errorResponse;
  }
}

/**
 * Speichert Kontaktanfrage in Datenbank
 */
async function saveContact(
  data: ContactFormData,
  request: NextRequest
): Promise<{ id: string; createdAt: string }> {
  // Hier würde die tatsächliche DB-Operation stehen
  // Simuliert für das Beispiel:
  
  const entry = {
    id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    createdAt: new Date().toISOString(),
    ip: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };

  // Simulierte DB-Operation
  await new Promise((resolve) => setTimeout(resolve, 50));

  logger.info('Contact saved', { 
    contactId: entry.id,
    email: data.email,
  });

  return entry;
}

/**
 * Sendet E-Mails mit Retry-Logik
 */
async function sendEmailsWithRetry(
  data: ContactFormData,
  contactId: string
): Promise<void> {
  if (!resend) return;

  await withRetry(
    async () => {
      // Admin E-Mail
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `Neue Kontaktanfrage: ${data.subject}`,
        html: getAdminEmailTemplate(data),
        replyTo: data.email,
      });

      // User Bestätigung
      await resend.emails.send({
        from: FROM_EMAIL,
        to: data.email,
        subject: 'Ihre Anfrage bei EduFunds wurde empfangen',
        html: getUserEmailTemplate(data),
      });

      logger.info('Emails sent successfully', { contactId });
    },
    {
      maxRetries: 3,
      initialDelayMs: 1000,
      backoffMultiplier: 2,
      onRetry: (attempt, error) => {
        logger.warn(`Email Retry ${attempt}`, { 
          contactId,
          error: error.message,
        });
      },
    },
    'EmailService'
  );
}

/**
 * Admin Email Template (vereinfacht)
 */
function getAdminEmailTemplate(data: ContactFormData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316 0%, #f59e0b 100%); padding: 30px; border-radius: 10px 10px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .field { margin-bottom: 20px; }
    .field-label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
    .field-value { font-size: 16px; color: #111827; }
    .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f97316; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Neue Kontaktanfrage</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">Name</div>
        <div class="field-value">${escapeHtml(data.name)}</div>
      </div>
      
      <div class="field">
        <div class="field-label">E-Mail</div>
        <div class="field-value">
          <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>
        </div>
      </div>
      
      <div class="field">
        <div class="field-label">Betreff</div>
        <div class="field-value">${escapeHtml(data.subject)}</div>
      </div>
      
      <div class="field">
        <div class="field-label">Nachricht</div>
        <div class="message-box">
          ${escapeHtml(data.message).replace(/\n/g, '<br>')}
        </div>
      </div>
      
      <div class="footer">
        <p>Diese Anfrage wurde über das Kontaktformular auf EduFunds.de gesendet.</p>
        <p>Zeitstempel: ${new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' })}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * User Email Template (vereinfacht)
 */
function getUserEmailTemplate(data: ContactFormData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .confirmation-box { background: #d1fae5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .confirmation-box h2 { color: #065f46; margin: 0 0 10px 0; font-size: 18px; }
    .confirmation-box p { color: #065f46; margin: 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Anfrage erfolgreich gesendet</h1>
    </div>
    <div class="content">
      <div class="confirmation-box">
        <h2>Vielen Dank für Ihre Nachricht!</h2>
        <p>Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
      </div>
      
      <div class="footer">
        <p>Dies ist eine automatische Bestätigungs-E-Mail.</p>
        <p style="margin-top: 10px;">
          <a href="https://edufunds.de/datenschutz">Datenschutzerklärung</a> | 
          <a href="https://edufunds.de/impressum">Impressum</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// OPTIONS Handler für CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}