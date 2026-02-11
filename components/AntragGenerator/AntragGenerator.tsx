"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  FileText, 
  Download, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { GenerierterAntrag, PipelineStatus } from "@/lib/programSchema";
import { exportAntrag, downloadFile, copyToClipboard } from "@/lib/antrag-export";

interface AntragGeneratorProps {
  programmId: string;
  programmName: string;
}

export function AntragGenerator({ programmId, programmName }: AntragGeneratorProps) {
  const [keywords, setKeywords] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>("");
  const [antrag, setAntrag] = useState<GenerierterAntrag | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    const keywordList = keywords
      .split(",")
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywordList.length < 3) {
      setError("Bitte geben Sie mindestens 3 Stichworte ein (durch Komma getrennt)");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setAntrag(null);

    try {
      const response = await fetch("/api/generate-antrag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programmId,
          keywords: keywordList
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Generierung fehlgeschlagen");
      }

      const data = await response.json();
      setAntrag(data.antrag);
      setProgress(100);
      setStatus("Antrag erfolgreich generiert!");
    } catch (err: any) {
      setError(err.message || "Ein unbekannter Fehler ist aufgetreten");
    } finally {
      setIsGenerating(false);
    }
  }, [keywords, programmId]);

  const handleExport = useCallback(async (format: "txt" | "html" | "docx" | "json") => {
    if (!antrag) return;

    const result = await exportAntrag(antrag, format);
    
    if (result.success && result.content) {
      downloadFile(result.content, result.filename);
    } else {
      setError(result.error || "Export fehlgeschlagen");
    }
  }, [antrag]);

  const handleCopy = useCallback(async () => {
    if (!antrag) return;
    
    const textContent = Object.values(antrag.sections)
      .map(s => s.content)
      .join("\n\n");
    
    const success = await copyToClipboard(textContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [antrag]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Eingabebereich */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            KI-Antragsgenerator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Stichworte (5-10 empfohlen, durch Komma getrennt)
            </label>
            <Textarea
              placeholder="z.B.: digitale Leseförderung, Tablets, Grundschule, KI-gestützt, 120 Kinder, Inklusion, Kooperation Universität"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              disabled={isGenerating}
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Je spezifischer die Stichworte, desto besser der generierte Antrag.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{status || "Generiere..."}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || keywords.split(",").filter(k => k.trim()).length < 3}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generiere Antrag...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Antrag generieren
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Ergebnis */}
      {antrag && (
        <Card className="border-green-200">
          <CardHeader className="bg-green-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                Antrag generiert
              </CardTitle>
              <Badge 
                variant={antrag.self_review.overall_score >= 80 ? "default" : "secondary"}
                className={getScoreColor(antrag.self_review.overall_score)}
              >
                Qualität: {antrag.self_review.overall_score}/100
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Qualitätsmetriken */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {antrag.metadata.api_calls}
                </div>
                <div className="text-xs text-muted-foreground">API-Calls</div>
              </div>
              <div className="bg-muted p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(antrag.metadata.generation_time_ms / 1000)}s
                </div>
                <div className="text-xs text-muted-foreground">Dauer</div>
              </div>
              <div className="bg-muted p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {antrag.metadata.revision_iterations}
                </div>
                <div className="text-xs text-muted-foreground">Revisionen</div>
              </div>
              <div className="bg-muted p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ${Number(antrag.kosten?.estimated_cost_usd || 0).toFixed(3)}
                </div>
                <div className="text-xs text-muted-foreground">Kosten</div>
              </div>
            </div>

            {/* Sektions-Vorschau */}
            <div className="space-y-4">
              <h3 className="font-medium">Generierte Sektionen</h3>
              {Object.entries(antrag.sections).map(([id, section]) => (
                <Card key={id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        {section.content.split("\n")[0].replace(/^#+\s*/, "")}
                      </h4>
                      <Badge 
                        variant="outline"
                        className={getScoreColor(section.quality_score)}
                      >
                        {section.quality_score}/100
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground line-clamp-3">
                      {section.content.substring(0, 200)}...
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{section.word_count} Wörter</span>
                      <span>{section.char_count} Zeichen</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Finanzplan */}
            <Card className="bg-muted">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Finanzübersicht</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Gesamtkosten</div>
                    <div className="font-medium">
                      {antrag.financials.gesamtkosten.toLocaleString("de-DE")} €
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Förderung</div>
                    <div className="font-medium text-green-600">
                      {antrag.financials.foerderbetrag.toLocaleString("de-DE")} €
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Eigenanteil</div>
                    <div className="font-medium">
                      {antrag.financials.eigenanteil.toLocaleString("de-DE")} €
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verbesserungsvorschläge */}
            {antrag.self_review.suggestions?.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-1">Verbesserungsvorschläge:</div>
                  <ul className="list-disc list-inside text-sm">
                    {antrag.self_review.suggestions.slice(0, 3).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Export-Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("txt")}
              >
                <FileText className="mr-2 h-4 w-4" />
                TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("html")}
              >
                <FileText className="mr-2 h-4 w-4" />
                HTML
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("docx")}
              >
                <FileText className="mr-2 h-4 w-4" />
                Word
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("json")}
              >
                <FileText className="mr-2 h-4 w-4" />
                JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Kopiert!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Kopieren
                  </>
                )}
              </Button>
            </div>

            {/* Hinweis */}
            <Alert variant="default" className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Wichtiger Hinweis:</strong> Dieser Antrag wurde KI-gestützt erstellt. 
                Überprüfen Sie alle Angaben, passen Sie spezifische Details an und ergänzen Sie 
                fehlende Informationen vor der Einreichung. Die Haftung liegt beim Antragsteller.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
