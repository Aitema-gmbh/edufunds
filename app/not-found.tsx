"use client";

import Link from "next/link";
import { FileQuestion, Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * 404 Not Found Seite
 * Wird angezeigt, wenn eine Route nicht existiert
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1a1f2e] via-[#0f1419] to-[#1a1f2e]">
      <Card className="max-w-lg w-full border-gray-700 bg-[#1a1f2e]/90 backdrop-blur-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-[#d4a853]/10 flex items-center justify-center mb-4">
            <FileQuestion className="w-10 h-10 text-[#d4a853]" />
          </div>
          <div className="text-6xl font-bold text-gray-700 mb-2">404</div>
          <CardTitle className="text-2xl text-white">
            Seite nicht gefunden
          </CardTitle>
          <CardDescription className="text-gray-400">
            Die gesuchte Seite existiert nicht oder wurde verschoben.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">
              Mögliche Ursachen:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-500 list-disc list-inside">
              <li>Falsche URL eingegeben</li>
              <li>Seite wurde verschoben oder gelöscht</li>
              <li>Link ist veraltet</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="w-full sm:flex-1">
            <Button
              className="w-full bg-gradient-to-r from-[#d4a853] to-[#c49b4a] hover:from-[#e4b860] hover:to-[#d4ab5a] text-[#0f1419] font-semibold"
            >
              <Home className="w-4 h-4 mr-2" />
              Zur Startseite
            </Button>
          </Link>
          
          <Link href="/foerderprogramme" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Programme suchen
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            className="w-full sm:w-auto text-gray-400 hover:text-white"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
