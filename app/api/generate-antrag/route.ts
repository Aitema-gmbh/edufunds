/**
 * API-Route für die Antragsgenerierung
 * POST /api/generate-antrag
 */

import { NextRequest, NextResponse } from "next/server";
import { createAntragPipeline, AntragPipeline } from "@/lib/antrag-pipeline";
import { GenerierterAntrag, PipelineStatus } from "@/lib/programSchema";

// Konfiguration
export const runtime = "edge";
export const maxDuration = 300; // 5 Minuten Timeout

interface GenerateRequest {
  programmId: string;
  keywords: string[];
  options?: {
    skipRevision?: boolean;
    targetScore?: number;
  };
}

// CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

// OPTIONS Handler für CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders
  });
}

// POST Handler
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse Request
    let body: GenerateRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Ungültiger JSON-Body" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    const { programmId, keywords, options } = body;
    
    // Validierung
    if (!programmId || !keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { error: "programmId und keywords (Array) sind erforderlich" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    if (keywords.length < 3) {
      return NextResponse.json(
        { error: "Mindestens 3 Stichworte erforderlich für qualitativ hochwertige Ergebnisse" },
        { status: 400, headers: corsHeaders }
      );
    }
    
    // Prüfe API-Key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "KI-API nicht konfiguriert. Bitte GEMINI_API_KEY setzen." },
        { status: 503, headers: corsHeaders }
      );
    }
    
    console.log(`[API] Generiere Antrag für ${programmId} mit Keywords: ${keywords.join(", ")}`);
    
    // Erstelle Pipeline
    let pipeline: AntragPipeline;
    try {
      pipeline = await createAntragPipeline(programmId, (status) => {
        // Progress-Callback (könnte für WebSocket/SSE verwendet werden)
        console.log(`[API] Progress: ${status.progress_percent}% - ${status.step}`);
      });
    } catch (error) {
      console.error("[API] Fehler beim Laden des Programm-Schemas:", error);
      return NextResponse.json(
        { error: `Programm-Schema für ${programmId} nicht gefunden` },
        { status: 404, headers: corsHeaders }
      );
    }
    
    // Führe Generierung durch
    let antrag: GenerierterAntrag;
    try {
      antrag = await pipeline.generateAntrag(keywords);
    } catch (error: any) {
      console.error("[API] Generierungsfehler:", error);
      return NextResponse.json(
        { error: `Fehler bei der Generierung: ${error.message}` },
        { status: 500, headers: corsHeaders }
      );
    }
    
    // Kosten-Tracking
    const kosten = pipeline.getKosten();
    
    // Erfolgs-Response
    const response = {
      success: true,
      antrag: {
        ...antrag,
        kosten: {
          api_calls: kosten.apiCalls,
          tokens_used: kosten.tokensUsed,
          estimated_cost_usd: kosten.estimatedCost.toFixed(4),
          generation_time_ms: antrag.metadata.generation_time_ms
        }
      },
      zusammenfassung: {
        programm: programmId,
        keywords_used: keywords,
        qualitaetsscore: antrag.self_review.overall_score,
        revisionen: antrag.metadata.revision_iterations,
        kosten_gesamt: kosten.estimatedCost.toFixed(4)
      }
    };
    
    console.log(`[API] Erfolgreich generiert in ${Date.now() - startTime}ms`);
    
    return NextResponse.json(response, { 
      status: 200, 
      headers: corsHeaders 
    });
    
  } catch (error: any) {
    console.error("[API] Unbekannter Fehler:", error);
    return NextResponse.json(
      { error: `Interner Serverfehler: ${error.message}` },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET Handler für verfügbare Schemas
export async function GET() {
  try {
    // Liste der verfügbaren Programm-Schemas
    const verfuegbareSchemas = [
      {
        id: "bmbf-digitalpakt-2",
        name: "DigitalPakt Schule 2.0 (BMBF)",
        beschreibung: "Bundesweite Förderung für digitale Bildung",
        komplexitaet: "hoch",
        foerdersumme: "10.000€ - 500.000€"
      },
      {
        id: "telekom-mint",
        name: "MINT-Förderung (Telekom Stiftung)",
        beschreibung: "MINT-Projekte in der Grundschule",
        komplexitaet: "mittel",
        foerdersumme: "5.000€ - 30.000€"
      },
      {
        id: "nrw-digital",
        name: "Digital.Schule.NRW",
        beschreibung: "Landesförderung für digitale Transformation",
        komplexitaet: "mittel",
        foerdersumme: "5.000€ - 100.000€"
      }
    ];
    
    return NextResponse.json({
      verfuegbare_programme: verfuegbareSchemas,
      api_version: "1.0.0",
      endpoints: {
        generate: "POST /api/generate-antrag",
        list: "GET /api/generate-antrag"
      }
    }, { headers: corsHeaders });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
