import { z } from 'zod';

/**
 * Newsletter subscription validation schema
 */
export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, 'E-Mail ist erforderlich')
    .email('Bitte geben Sie eine gültige E-Mail-Adresse ein')
    .transform((email) => email.toLowerCase().trim()),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;

/**
 * Newsletter subscription database interface
 */
export interface NewsletterSubscription {
  id: string;
  email: string;
  confirmed: boolean;
  token: string;
  createdAt: string;
  confirmedAt?: string;
  ipAddress?: string;
}
