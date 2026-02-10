import { z } from 'zod';

/**
 * Zod Schema für das Kontaktformular
 * Wird sowohl im Backend (API) als auch im Frontend verwendet
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(100, 'Name darf maximal 100 Zeichen lang sein'),
  
  email: z
    .string()
    .email('Bitte geben Sie eine gültige E-Mail-Adresse ein')
    .max(255, 'E-Mail darf maximal 255 Zeichen lang sein'),
  
  subject: z
    .string()
    .min(5, 'Betreff muss mindestens 5 Zeichen lang sein')
    .max(200, 'Betreff darf maximal 200 Zeichen lang sein'),
  
  message: z
    .string()
    .min(20, 'Nachricht muss mindestens 20 Zeichen lang sein')
    .max(5000, 'Nachricht darf maximal 5000 Zeichen lang sein'),
  
  datenschutz: z.literal(true, {
    errorMap: () => ({ message: 'Sie müssen der Datenschutzerklärung zustimmen' }),
  }),
  
  // Honeypot Feld für Spam-Schutz (sollte vom User nicht ausgefüllt werden)
  website: z.string().optional(),
  
  // Zeitstempel für Zeit-Check Spam-Schutz
  timestamp: z.number().optional(),
});

/**
 * TypeScript Typ für das Kontaktformular
 */
export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Hilfsfunktion zur Validierung von Kontaktformular-Daten
 */
export function validateContactForm(data: unknown) {
  return contactFormSchema.safeParse(data);
}

/**
 * Hilfsfunktion zur Validierung einzelner Felder (für client-seitige Validierung)
 */
export function validateContactField<T extends keyof ContactFormData>(
  field: T,
  value: unknown
) {
  const fieldSchema = contactFormSchema.shape[field];
  return fieldSchema.safeParse(value);
}
