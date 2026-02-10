import { z } from 'zod';

// Zod Schema für Kontaktformular-Validierung
export const contactSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  subject: z.string().min(5, 'Betreff muss mindestens 5 Zeichen lang sein'),
  message: z.string().min(20, 'Nachricht muss mindestens 20 Zeichen lang sein'),
  datenschutz: z.literal(true, {
    errorMap: () => ({ message: 'Sie müssen der Datenschutzerklärung zustimmen' }),
  }),
  // Honeypot Feld für Spam-Schutz (sollte leer sein)
  website: z.string().optional(),
  // Zeitstempel für Spam-Schutz (mindestens 3 Sekunden zwischen Laden und Absenden)
  timestamp: z.number().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
