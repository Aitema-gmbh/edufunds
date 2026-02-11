/**
 * Export-Funktionen für generierte Anträge
 * Unterstützt: DOCX, PDF, TXT, HTML
 */

import { GenerierterAntrag, ExportConfig, ExportFormat } from "./programSchema";

// Typen für Export
export interface ExportResult {
  success: boolean;
  format: ExportFormat;
  content?: Blob;
  dataUrl?: string;
  filename: string;
  error?: string;
}

/**
 * Exportiert einen Antrag im gewünschten Format
 */
export async function exportAntrag(
  antrag: GenerierterAntrag,
  format: ExportFormat,
  config?: Partial<ExportConfig>
): Promise<ExportResult> {
  const exportConfig: ExportConfig = {
    format,
    include_header: true,
    include_footer: true,
    include_page_numbers: true,
    ...config
  };
  
  switch (format) {
    case "txt":
      return exportAsText(antrag, exportConfig);
    case "html":
      return exportAsHTML(antrag, exportConfig);
    case "docx":
      return await exportAsDOCX(antrag, exportConfig);
    case "pdf":
      return await exportAsPDF(antrag, exportConfig);
    case "json":
      return exportAsJSON(antrag, exportConfig);
    default:
      return {
        success: false,
        format,
        filename: "",
        error: `Nicht unterstütztes Format: ${format}`
      };
  }
}

/**
 * Text-Export (einfachster Fall)
 */
function exportAsText(antrag: GenerierterAntrag, config: ExportConfig): ExportResult {
  let content = "";
  
  if (config.include_header) {
    content += `FÖRDERANTRAG\n`;
    content += `Programm: ${antrag.programm_id}\n`;
    content += `Generiert am: ${new Date(antrag.generiert_am).toLocaleDateString("de-DE")}\n`;
    content += `Qualitätsscore: ${antrag.self_review.overall_score}/100\n`;
    content += `\n${"=".repeat(60)}\n\n`;
  }
  
  // Sektionen
  Object.entries(antrag.sections).forEach(([id, section]) => {
    content += section.content;
    content += "\n\n";
  });
  
  // Finanzplan
  content += `\n${"=".repeat(60)}\n`;
  content += "FINANZPLAN\n";
  content += `\nGesamtkosten: ${antrag.financials.gesamtkosten.toLocaleString("de-DE")} €\n`;
  content += `Beantragte Förderung: ${antrag.financials.foerderbetrag.toLocaleString("de-DE")} €\n`;
  content += `Eigenanteil: ${antrag.financials.eigenanteil.toLocaleString("de-DE")} €\n`;
  
  if (config.include_footer) {
    content += `\n${"=".repeat(60)}\n`;
    content += `Generiert mit EduFunds KI-Antragsgenerator\n`;
    content += `Dieser Antrag wurde KI-gestützt erstellt und muss vor Einreichung geprüft werden.\n`;
  }
  
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  
  return {
    success: true,
    format: "txt",
    content: blob,
    filename: `antrag_${antrag.programm_id}_${new Date().toISOString().split("T")[0]}.txt`
  };
}

/**
 * HTML-Export (für Vorschau)
 */
function exportAsHTML(antrag: GenerierterAntrag, config: ExportConfig): ExportResult {
  let html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Förderantrag ${antrag.programm_id}</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #1e40af;
      margin: 0 0 10px 0;
    }
    .meta {
      color: #666;
      font-size: 14px;
    }
    .section {
      margin: 30px 0;
      page-break-inside: avoid;
    }
    .section h1 {
      color: #1e40af;
      font-size: 24px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
    }
    .section h2 {
      color: #374151;
      font-size: 18px;
      margin-top: 25px;
    }
    .financials {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
    }
    .financials h2 {
      margin-top: 0;
      color: #1e40af;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .score {
      display: inline-block;
      background: ${antrag.self_review.overall_score >= 80 ? '#10b981' : antrag.self_review.overall_score >= 60 ? '#f59e0b' : '#ef4444'};
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
`;
  
  if (config.include_header) {
    html += `
  <div class="header">
    <h1>Förderantrag</h1>
    <div class="meta">
      <p><strong>Programm:</strong> ${antrag.programm_id}</p>
      <p><strong>Generiert am:</strong> ${new Date(antrag.generiert_am).toLocaleDateString("de-DE")}</p>
      <p><strong>Qualitätsscore:</strong> <span class="score">${antrag.self_review.overall_score}/100</span></p>
    </div>
  </div>
`;
  }
  
  // Sektionen
  Object.entries(antrag.sections).forEach(([id, section]) => {
    // Konvertiere Markdown-ähnliche Headers zu HTML
    let sectionHtml = section.content
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\n\n/g, '</p><p>');
    
    html += `
  <div class="section">
    ${sectionHtml}
  </div>
`;
  });
  
  // Finanzplan
  html += `
  <div class="financials">
    <h2>Finanzplan</h2>
    <p><strong>Gesamtkosten:</strong> ${antrag.financials.gesamtkosten.toLocaleString("de-DE")} €</p>
    <p><strong>Beantragte Förderung:</strong> ${antrag.financials.foerderbetrag.toLocaleString("de-DE")} €</p>
    <p><strong>Eigenanteil:</strong> ${antrag.financials.eigenanteil.toLocaleString("de-DE")} €</p>
  </div>
`;
  
  if (config.include_footer) {
    html += `
  <div class="footer no-print">
    <p>Generiert mit EduFunds KI-Antragsgenerator</p>
    <p>Dieser Antrag wurde KI-gestützt erstellt und muss vor Einreichung geprüft werden.</p>
  </div>
`;
  }
  
  html += `
</body>
</html>`;
  
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  
  return {
    success: true,
    format: "html",
    content: blob,
    filename: `antrag_${antrag.programm_id}_${new Date().toISOString().split("T")[0]}.html`
  };
}

/**
 * DOCX-Export (simuliert - in Produktion mit docx.js)
 */
async function exportAsDOCX(antrag: GenerierterAntrag, config: ExportConfig): Promise<ExportResult> {
  // Hinweis: Für echte DOCX-Generierung müsste docx.js installiert werden
  // Dies ist ein vereinfachter HTML-basierter Ansatz
  
  const htmlResult = exportAsHTML(antrag, config);
  
  if (!htmlResult.content) {
    return {
      success: false,
      format: "docx",
      filename: "",
      error: "Fehler bei der HTML-Konvertierung"
    };
  }
  
  // Für Word optimiertes HTML (MHTML-Format)
  const wordHtml = `
MIME-Version: 1.0
Content-Type: multipart/related; boundary="----=_NextPart_01"

------=_NextPart_01
Content-Location: file:///C:/antrag.htm
Content-Type: text/html; charset="utf-8"

<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
<meta charset="utf-8">
<title>Antrag</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
</w:WordDocument>
</xml>
<![endif]-->
</head>
<body>
${await htmlResult.content.text()}
</body>
</html>

------=_NextPart_01--
`;
  
  const blob = new Blob([wordHtml], { type: "application/msword" });
  
  return {
    success: true,
    format: "docx",
    content: blob,
    filename: `antrag_${antrag.programm_id}_${new Date().toISOString().split("T")[0]}.doc`
  };
}

/**
 * PDF-Export (simuliert - in Produktion mit Puppeteer oder ähnlich)
 */
async function exportAsPDF(antrag: GenerierterAntrag, config: ExportConfig): Promise<ExportResult> {
  // Hinweis: Für echte PDF-Generierung müsste Puppeteer oder jsPDF verwendet werden
  // Dies ist ein Platzhalter, der HTML zurückgibt
  
  return {
    success: false,
    format: "pdf",
    filename: "",
    error: "PDF-Export erfordert Server-seitige Generierung (Puppeteer). Bitte nutzen Sie HTML-Export und 'Drucken als PDF'."
  };
}

/**
 * JSON-Export (für Weiterverarbeitung)
 */
function exportAsJSON(antrag: GenerierterAntrag, config: ExportConfig): ExportResult {
  const exportData = {
    meta: {
      programm_id: antrag.programm_id,
      schema_version: antrag.version,
      generiert_am: antrag.generiert_am,
      export_format: "json"
    },
    qualitaet: {
      overall_score: antrag.self_review.overall_score,
      criteria_scores: antrag.self_review.criteria_scores,
      suggestions: antrag.self_review.suggestions
    },
    sections: Object.entries(antrag.sections).map(([id, section]) => ({
      id,
      title: section.content.split("\n")[0].replace(/^#+\s*/, ""),
      content: section.content,
      quality_score: section.quality_score,
      word_count: section.word_count,
      char_count: section.char_count
    })),
    financials: antrag.financials,
    metadata: antrag.metadata
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
    type: "application/json;charset=utf-8" 
  });
  
  return {
    success: true,
    format: "json",
    content: blob,
    filename: `antrag_${antrag.programm_id}_${new Date().toISOString().split("T")[0]}.json`
  };
}

/**
 * Helper: Download einer Datei im Browser
 */
export function downloadFile(blob: Blob, filename: string) {
  if (typeof window === "undefined") return;
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Helper: In Zwischenablage kopieren
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Kopieren fehlgeschlagen:", err);
    return false;
  }
}
