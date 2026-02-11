import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
      console.log("Gemini nicht verfügbar, nutze Fallback-Generator");
      const fallbackAntrag = generateFallbackAntrag(programm, projektDaten);
      return NextResponse.json({ 
        antrag: fallbackAntrag,
        model: "fallback-template",
        timestamp: new Date().toISOString(),
        note: "KI-Modell temporär nicht verfügbar - qualitativ hochwertiger Template-basierter Antrag wurde generiert"
      }, {
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetTime / 1000))
        }
      });
    }

    // Gemini Model initialisieren
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4000,
      }
    });

    // Prompt bauen
    const prompt = buildPrompt(programm, projektDaten);

    // Antrag generieren
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return NextResponse.json({ 
      antrag: text,
      model: "gemini-1.5-flash",
      timestamp: new Date().toISOString()
    }, {
      headers: {
        "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetTime / 1000))
      }
    });

  } catch (error) {
    console.error("KI-Antrag Generierungsfehler:", error);
    
    // Bei Fehler: Fallback nutzen
    try {
      const body = await request.json();
      const fallbackAntrag = generateFallbackAntrag(body.programm, body.projektDaten);
      return NextResponse.json({ 
        antrag: fallbackAntrag,
        model: "fallback-error",
        timestamp: new Date().toISOString(),
        note: "Fehler bei KI-Generierung - Fallback wurde erstellt"
      }, {
        headers: {
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetTime / 1000))
        }
      });
    } catch {
      return NextResponse.json(
        { error: "Fehler bei der Antragsgenerierung", details: String(error) },
        { status: 500 }
      );
    }
  }
}

function buildPrompt(programm: any, projektDaten: any): string {
  return `Du bist ein erfahrener Antragsberater für schulische Förderprogramme in Deutschland. 
Erstelle einen professionellen, überzeugenden Förderantrag im Markdown-Format.

## PROGRAMMDETAILS
- Programm: ${programm.name}
- Fördergeber: ${programm.foerdergeber}
- Fördergeber-Typ: ${programm.foerdergeberTyp}
- Fördersumme: ${programm.foerdersummeText}
- Bewerbungsfrist: ${programm.bewerbungsfristText}
- Kategorien: ${programm.kategorien.join(", ")}
- Kurzbeschreibung Programm: ${programm.kurzbeschreibung}

## SCHULE UND PROJEKT
- Schulname: ${projektDaten.schulname}
- Projekttitel: ${projektDaten.projekttitel}
- Beantragter Förderbetrag: ${projektDaten.foerderbetrag} €
- Projektlaufzeit: ${projektDaten.zeitraum}
- Zielgruppe: ${projektDaten.zielgruppe}

## PROJEKTBESCHREIBUNG
${projektDaten.kurzbeschreibung}

## PROJEKTZIELE
${projektDaten.ziele}

## HAUPTAKTIVITÄTEN
${projektDaten.hauptaktivitaeten}

## ERWARTETE ERGEBNISSE
${projektDaten.ergebnisse || "- Noch nicht spezifiziert"}

## NACHHALTIGKEIT
${projektDaten.nachhaltigkeit || "- Noch nicht spezifiziert"}

## ANFORDERUNGEN AN DEN ANTRAG

Erstelle einen vollständigen Förderantrag mit folgender Struktur:

1. **EINLEITUNG UND PROJEKTÜBERSICHT** (150-200 Wörter)
2. **PROJEKTBESCHREIBUNG** (200-250 Wörter)
3. **PROJEKTUMSETZUNG** (200-250 Wörter)
4. **ZIELGRUPPE UND TEILNEHMENDE** (100-150 Wörter)
5. **PASSUNG ZUM FÖRDERPROGRAMM** (100-150 Wörter)
6. **ERWARTETE ERGEBNISSE UND WIRKUNG** (150-200 Wörter)
7. **BUDGETÜBERSICHT** (100-150 Wörter)
8. **ABSCHLUSS** (50-100 Wörter)

Zwischen 1200-1800 Wörter insgesamt. Professioneller Ton (Bildungssprache).`;
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
