import { ContactFormData, validateContactForm } from './contactSchema';

export interface ContactFormResult {
  success: boolean;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * Sendet eine Kontaktanfrage an das Backend
 */
export async function submitContactForm(
  formData: Omit<ContactFormData, 'timestamp'>
): Promise<ContactFormResult> {
  // Client-seitige Validierung
  const validation = validateContactForm({
    ...formData,
    timestamp: Date.now(),
  });

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      })),
    };
  }

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        timestamp: Date.now(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.error || 'Ein Fehler ist aufgetreten',
        errors: data.errors,
      };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Verbindungsfehler. Bitte versuchen Sie es später erneut.',
    };
  }
}

/**
 * Prüft, ob ein Feld valide ist (für Echtzeit-Validierung)
 */
export function validateField(
  field: keyof ContactFormData,
  value: unknown
): string | null {
  const fieldSchemas: Record<string, import('zod').ZodTypeAny> = {
    name: import('./contactSchema').then((m) => m.contactFormSchema.shape.name),
    email: import('./contactSchema').then((m) => m.contactFormSchema.shape.email),
    subject: import('./contactSchema').then((m) => m.contactFormSchema.shape.subject),
    message: import('./contactSchema').then((m) => m.contactFormSchema.shape.message),
    datenschutz: import('./contactSchema').then((m) => m.contactFormSchema.shape.datenschutz),
  };

  return null; // Wird bei Bedarf implementiert
}
