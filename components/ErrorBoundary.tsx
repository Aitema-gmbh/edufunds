"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw, Home, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

/**
 * Error Boundary Komponente für EduFunds
 * Fängt JavaScript-Fehler in React-Komponenten ab und zeigt eine benutzerfreundliche Fehlerseite
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    // Generiere eine eindeutige Fehler-ID für Debugging
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Fehler-Logging für Debugging
    console.error("EduFunds Error Boundary hat einen Fehler abgefangen:", {
      errorId: this.state.errorId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
    });

    this.setState({
      errorInfo,
    });

    // Optionaler Callback für externe Fehler-Tracking-Dienste
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Hier könnte ein externer Service wie Sentry aufgerufen werden
    // this.logErrorToService(error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: "",
    });
  };

  private handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  public render() {
    if (this.state.hasError) {
      // Benutzerdefiniertes Fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Standard Error Fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1a1f2e] via-[#0f1419] to-[#1a1f2e]">
          <Card className="max-w-lg w-full border-red-500/20 bg-[#1a1f2e]/80 backdrop-blur-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-white">
                Ein Fehler ist aufgetreten
              </CardTitle>
              <CardDescription className="text-gray-400">
                Es tut uns leid, aber etwas ist schiefgelaufen.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                <p className="text-sm text-gray-300">
                  <strong className="text-red-400">Fehler-ID:</strong>{" "}
                  <code className="text-xs bg-red-500/10 px-2 py-1 rounded">
                    {this.state.errorId}
                  </code>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Bitte notieren Sie diese ID, wenn Sie den Support kontaktieren.
                </p>
              </div>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 overflow-auto max-h-48">
                  <p className="text-xs font-mono text-red-400 mb-2">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="text-xs text-gray-500 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-white">Mögliche Lösungen:</h4>
                <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
                  <li>Seite neu laden und erneut versuchen</li>
                  <li>Browser-Cache leeren</li>
                  <li>In einem anderen Browser testen</li>
                  <li>Bei wiederholtem Auftreten: Support kontaktieren</li>
                </ul>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.handleReload}
                className="w-full sm:w-auto bg-gradient-to-r from-[#d4a853] to-[#c49b4a] hover:from-[#e4b860] hover:to-[#d4ab5a] text-[#0f1419] font-semibold"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Seite neu laden
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Zur Startseite
              </Button>
              
              <Button
                variant="ghost"
                className="w-full sm:w-auto text-gray-400 hover:text-white"
                onClick={() => window.open("mailto:support@edufunds.de?subject=Fehler%20berichten&body=Fehler-ID:%20" + this.state.errorId, "_blank")}
              >
                <Mail className="w-4 h-4 mr-2" />
                Support
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC (Higher Order Component) für einfache Nutzung der Error Boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || "Component"})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;
