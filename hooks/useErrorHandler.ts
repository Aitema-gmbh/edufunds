"use client";

import { useState, useCallback } from "react";
import { KIAntragError } from "@/lib/ki-antrag-generator";

interface ErrorState {
  hasError: boolean;
  message: string;
  code: string;
  recoverable: boolean;
}

interface UseErrorHandlerReturn {
  error: ErrorState | null;
  setError: (error: unknown) => void;
  clearError: () => void;
  handleError: (error: unknown) => void;
  retry: () => void;
}

/**
 * Hook für zentrale Fehlerbehandlung
 * Verwendung: const { error, setError, clearError } = useErrorHandler();
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setErrorState] = useState<ErrorState | null>(null);

  const setError = useCallback((err: unknown) => {
    if (err instanceof KIAntragError) {
      setErrorState({
        hasError: true,
        message: err.message,
        code: err.code,
        recoverable: err.recoverable,
      });
    } else if (err instanceof Error) {
      // Bestimme ob Fehler wiederholbar ist
      const recoverable = 
        err.message.includes("timeout") ||
        err.message.includes("network") ||
        err.message.includes("fetch") ||
        err.message.includes("Zeitüberschreitung");
      
      setErrorState({
        hasError: true,
        message: err.message,
        code: "UNKNOWN_ERROR",
        recoverable,
      });
    } else if (typeof err === "string") {
      setErrorState({
        hasError: true,
        message: err,
        code: "UNKNOWN_ERROR",
        recoverable: false,
      });
    } else {
      setErrorState({
        hasError: true,
        message: "Ein unerwarteter Fehler ist aufgetreten",
        code: "UNKNOWN_ERROR",
        recoverable: false,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const handleError = useCallback((err: unknown) => {
    console.error("ErrorHandler caught error:", err);
    setError(err);
  }, [setError]);

  const retry = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    error,
    setError,
    clearError,
    handleError,
    retry,
  };
}

export default useErrorHandler;
