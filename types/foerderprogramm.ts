export interface Förderprogramm {
  id: string;
  name: string;
  foerdergeber: string;
  foerdergeberTyp: "bund" | "land" | "stiftung" | "eu" | "sonstige";
  schulformen: string[];
  bundeslaender: string[];
  foerdersummeMin?: number;
  foerdersummeMax?: number;
  foerdersummeText: string;
  kategorien: string[];
  bewerbungsfristText?: string;
  bewerbungsfristStart?: string;
  bewerbungsfristEnde?: string;
  bewerbungsart: "online" | "schriftlich" | "beides";
  infoLink?: string;
  antragsLink?: string;
  kontaktEmail?: string;
  kurzbeschreibung: string;
  beschreibung?: string;
  status: "aktiv" | "inaktiv" | "archiviert";
  kiAntragGeeignet: boolean;
  kiHinweise?: string;
  createdAt: string;
  updatedAt: string;
  quelle: string;
}

export type Foerderprogramm = Förderprogramm;
