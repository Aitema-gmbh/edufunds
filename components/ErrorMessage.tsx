"use client";

import React from "react";
import { AlertCircle, RefreshCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorMessageProps {
  title?: string;
  message: string;
  code?: string;
  recoverable?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Wiederverwendbare Fehlermeldungs-Komponente
 */
export function ErrorMessage({
  title = "Fehler",
  message,
  code,
  recoverable = false,
  onRetry,
  onDismiss,
  className = "",
}: ErrorMessageProps) {
  return (
    <Alert
      variant="destructive"
      className={`border-red-500/30 bg-red-500/5 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <AlertTitle className="text-red-400 flex items-center gap-2">
            {title}
            {code && (
              <code className="text-xs bg-red-500/10 px-1.5 py-0.5 rounded">
                {code}
              </code>
            )}
          </AlertTitle>
          <AlertDescription className="text-gray-400 mt-1">
            {message}
          </AlertDescription>
          
          {(recoverable || onRetry) && (
            <div className="mt-3 flex gap-2">
              {onRetry && (
                <Button
                  size="sm"
                  onClick={onRetry}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30"
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Erneut versuchen
                </Button>
              )}
              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="text-gray-500 hover:text-gray-400"
                >
                  <X className="w-4 h-4 mr-2" />
                  Schließen
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}

export default ErrorMessage;
