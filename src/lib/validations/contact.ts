import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Keep it under 120 characters'),
  email: z.string().trim().email('Enter a valid email address').max(254),
  message: z
    .string()
    .trim()
    .min(10, 'Tell us a little more — at least 10 characters')
    .max(4000, 'Keep it under 4000 characters'),
});

export type ContactInput = z.infer<typeof contactSchema>;
