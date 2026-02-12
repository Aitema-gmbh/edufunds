import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Force Node.js runtime (not Edge) to avoid EvalError
export const runtime = 'nodejs';

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Simple in-memory rate limiting (for production, use Redis)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIP(request: NextRequest): string {
  // Try to get real IP from headers (when behind proxy)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback to a default (in production, you'd want to handle this better)
  return "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  
  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetTime: now + RATE_LIMIT_WINDOW_MS };
  }
  
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }
  
  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetTime: entry.resetTime };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, ip) => {
    if (now > entry.resetTime) {
      rateLimitStore.delete(ip);
    }
  });
}, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  // Rate limiting check
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP);
  
  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
    return NextResponse.json(
      { 
        error: "Rate limit exceeded", 
        message: "Zu viele Anfragen. Bitte warten Sie einen Moment.",
        retryAfter 
      },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetTime / 1000)),
          "Retry-After": String(retryAfter)
        }
      }
    );
  }

  try {
    const { programm, projektDaten } = await request.json();

    if (!programm || !projektDaten) {
      return NextResponse.json(
        { error: "Fehlende Daten: programm und projektDaten erforderlich" },
        { status: 400 }
      );
    }

    // Wenn Gemini nicht verfügbar, nutze Fallback
    if (!genAI) {
      console.log("[KI-Generator] Gemini nicht verfügbar, nutze Fallback-Generator");
      const fallbackAntrag = generateFallbackAntrag(programm, projektDaten);
      return NextResponse.json({ 
        antrag: fallbackAntrag,
        model: "fallback-template",
        timestamp: new Date().toISOString(),
        note: "KI-Service nicht konfiguriert - qualitativ hochwertiger Template-basierter Antrag wurde generiert",
        isFallback: true,
        config: {
          maxRetries: 3,
          maxOutputTokens: 2500
        }
      }, {
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetTime / 1000)),
          "X-KI-Status": "fallback-no-api-key"
        }
      });
    }

    // Gemini Model initialisieren (optimiert: 2500 Tokens statt 4000)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2500,  // Reduziert von 4000
      }
    });

    // Prompt bauen
    const prompt = buildPrompt(programm, projektDaten);

    // Antrag generieren mit Retry-Mechanismus (max 3 Versuche)
    let lastError: Error | null = null;
    let text = "";
    const MAX_RETRIES = 3;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[KI-Generator] Versuch ${attempt}/${MAX_RETRIES}...`);
        const result = await model.generateContent(prompt);
        const response = result.response;
        text = response.text();
        
        // Validierung: Antrag muss Mindestlänge haben
        if (text.length < 500) {
          throw new Error("Generierter Antrag zu kurz (< 500 Zeichen)");
        }
        
        console.log(`[KI-Generator] Erfolg nach ${attempt} Versuch(en)`);
        break; // Erfolg, Schleife beenden
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`[KI-Generator] Versuch ${attempt} fehlgeschlagen:`, error);
        
        if (attempt < MAX_RETRIES) {
          // Exponentieller Backoff: 1s, 2s, 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          console.log(`[KI-Generator] Warte ${delay}ms vor Retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // Wenn alle Versuche fehlgeschlagen sind
    if (!text && lastError) {
      throw new Error(`KI-Generierung nach ${MAX_RETRIES} Versuchen fehlgeschlagen: ${lastError.message}`);
    }

    // Erfolgreiche KI-Generierung
    return NextResponse.json({
      antrag: text,
      model: "gemini-2.0-flash",
      timestamp: new Date().toISOString(),
      isFallback: false,
      stats: {
        promptLength: prompt.length,
        responseLength: text.length,
        estimatedTokens: Math.ceil((prompt.length + text.length) / 4),
        maxOutputTokens: 2500
      },
      config: {
        maxRetries: 3,
        temperature: 0.3
      }
    }, {
      headers: {
        "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetTime / 1000)),
        "X-KI-Status": "success"
      }
    });

  } catch (error) {
    console.error("[KI-Generator] Fehler:", error);
    
    // Nutzerfreundliche Fehlermeldungen basierend auf Fehlertyp
    let errorMessage = "Die KI-Antragsgenerierung ist momentan nicht verfügbar.";
    let errorCode = "KI_ERROR";
    let suggestion = "Bitte versuche es in wenigen Minuten erneut.";
    
    const errorStr = String(error);
    
    if (errorStr.includes("429") || errorStr.includes("rate limit")) {
      errorMessage = "Zu viele Anfragen an den KI-Service.";
      errorCode = "RATE_LIMIT";
      suggestion = "Bitte warte 1-2 Minuten und versuche es erneut.";
    } else if (errorStr.includes("503") || errorStr.includes("unavailable") || errorStr.includes("429")) {
      errorMessage = "Der KI-Service ist temporär nicht erreichbar.";
      errorCode = "SERVICE_UNAVAILABLE";
      suggestion = "Wir generieren einen qualitativ hochwertigen Antrag mit unserem Template-System.";
    } else if (errorStr.includes("400") || errorStr.includes("validation")) {
      errorMessage = "Die Anfrage konnte nicht verarbeitet werden.";
      errorCode = "VALIDATION_ERROR";
      suggestion = "Bitte überprüfe die eingegebenen Daten und versuche es erneut.";
    } else if (errorStr.includes("timeout") || errorStr.includes("504")) {
      errorMessage = "Die Anfrage hat zu lange gedauert.";
      errorCode = "TIMEOUT";
      suggestion = "Bitte versuche es mit kürzeren Projektdaten erneut.";
    }
    
    // Bei Fehler: Fallback nutzen (Graceful Degradation)
    try {
      const body = await request.json();
      const fallbackAntrag = generateFallbackAntrag(body.programm, body.projektDaten);
      
      return NextResponse.json({ 
        antrag: fallbackAntrag,
        model: "fallback-template",
        timestamp: new Date().toISOString(),
        error: {
          code: errorCode,
          message: errorMessage,
          suggestion: suggestion
        },
        note: "KI-Service temporär nicht verfügbar - Template-basierter Antrag wurde erstellt",
        isFallback: true
      }, {
        status: 200, // 200 OK mit Fallback
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetTime / 1000)),
          "X-KI-Status": "fallback"
        }
      });
    } catch (parseError) {
      // Wenn Fallback auch fehlschlägt
      return NextResponse.json(
        { 
          error: errorMessage,
          code: errorCode,
          suggestion: suggestion,
          details: String(error)
        },
        { status: 503 }
      );
    }
  }
}

// Optimierte Prompt-Templates (~1000-1200 Token statt ~2600)
const SYSTEM_PROMPT_KURZ = `Antragsberater für Bildungsförderung. Stil: sachlich, präzise, aktiv. Regeln: 1 Adjektiv/Satz, konkrete Daten, These→Beleg→Nutzen.`;

function buildPrompt(programm: any, projektDaten: any): string {
  return `${SYSTEM_PROMPT_KURZ}

PROGRAMM: ${programm.name} | ${programm.foerdergeber} (${programm.foerdergeberTyp})
Frist: ${programm.bewerbungsfristText || 'laufend'} | Summe: ${programm.foerdersummeText}
Kategorien: ${programm.kategorien?.join(", ") || "Allgemein"}

PROJEKT: ${projektDaten.projekttitel} | ${projektDaten.schulname}
Betrag: ${projektDaten.foerderbetrag}€ | Zeitraum: ${projektDaten.zeitraum}
Zielgruppe: ${projektDaten.zielgruppe}

Beschreibung: ${projektDaten.kurzbeschreibung}
Ziele: ${projektDaten.ziele}
Aktivitäten: ${projektDaten.hauptaktivitaeten}
Ergebnisse: ${projektDaten.ergebnisse || 'Werden erwartet'}
Nachhaltigkeit: ${projektDaten.nachhaltigkeit || 'Dauerhafte Verankerung geplant'}

STRUKTUR (Markdown):
1. Einleitung (150W)
2. Projektbeschreibung (200W) 
3. Umsetzung (200W)
4. Zielgruppe (100W)
5. Passung zum Programm (100W)
6. Ergebnisse/Wirkung (150W)
7. Budget (Tabelle)
8. Abschluss (50W)

ZIEL: 1200-1500 Wörter, professionell, überzeugend.`;
}

// Fallback-Generator wenn KI nicht verfügbar
function generateFallbackAntrag(programm: any, projektDaten: any): string {
  const kategorienText = programm.kategorien?.join(", ") || "Bildung";
  
  return `# FÖRDERANTRAG

## ${projektDaten.projekttitel}

---

### 1. EINLEITUNG UND PROJEKTÜBERSICHT

Die ${projektDaten.schulname} beantragt im Rahmen des Programms „${programm.name}" (${programm.foerdergeber}) einen Zuschuss in Höhe von ${Number(projektDaten.foerderbetrag).toLocaleString("de-DE")} €.

**Projektträger:** ${projektDaten.schulname}  
**Projektlaufzeit:** ${projektDaten.zeitraum}  
**Beantragte Fördersumme:** ${Number(projektDaten.foerderbetrag).toLocaleString("de-DE")} €

${projektDaten.kurzbeschreibung}

---

### 2. PROJEKTBESCHREIBUNG

**Projektziele:**  
${projektDaten.ziele}

**Zielgruppe:**  
${projektDaten.zielgruppe}

Das Projekt adressiert die Kategorien: ${kategorienText}

---

### 3. PROJEKTUMSETZUNG

**Geplante Hauptaktivitäten:**  
${projektDaten.hauptaktivitaeten}

**Projektphasen:**
1. **Vorbereitungsphase (Monat 1-2):** Bedarfsanalyse, Feinkonzeption
2. **Implementierungsphase (Monat 3-8):** Umsetzung der Aktivitäten
3. **Intensivierungsphase (Monat 9-10):** Verstetigung der Strukturen
4. **Abschlussphase (Monat 11-12):** Ergebnissicherung

---

### 4. ZIELGRUPPE UND TEILNEHMENDE

${projektDaten.zielgruppe}

Das Projekt erreicht direkt die Teilnehmenden und indirekt die gesamte Schulgemeinschaft durch Multiplikatoreffekte.

---

### 5. PASSUNG ZUM FÖRDERPROGRAMM

Das Projekt passt hervorragend zu „${programm.name}" und erfüllt alle Förderkriterien:

- Übereinstimmung mit den Programmzielen
- Relevanz für die Zielgruppe
- Innovativer Ansatz
- Nachhaltige Wirkung

---

### 6. ERWARTETE ERGEBNISSE UND WIRKUNG

${projektDaten.ergebnisse || "- Konkrete Projektergebnisse\n- Nachhaltige Verankerung\n- Qualitative Verbesserungen"}

**Wirkungen:**
- Direkte Nutzung durch die Zielgruppe
- Langfristige Verbesserung der Bildungsqualität
- Multiplikatoreffekte für die gesamte Schule

---

### 7. BUDGETÜBERSICHT

| Position | Betrag (€) |
|----------|------------|
| Beantragte Förderung | ${Number(projektDaten.foerderbetrag).toLocaleString("de-DE")} |
| Programm | ${programm.name} |
| Fördergeber | ${programm.foerdergeber} |

---

### 8. ABSCHLUSS

${projektDaten.nachhaltigkeit || "Das Projekt ist für nachhaltige Wirkung konzipiert. Entwickelte Konzepte werden in den Regelbetrieb überführt."}

Die ${projektDaten.schulname} freut sich auf eine positive Prüfung und die Möglichkeit, mit diesem Projekt einen wertvollen Beitrag zu leisten.

Mit freundlichen Grüßen  
Das Projektteam der ${projektDaten.schulname}

---

*Hinweis: Dieser Antrag wurde mit dem EduFunds KI-Antragsassistenten erstellt.*
`;
}
