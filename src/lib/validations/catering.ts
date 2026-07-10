import { z } from 'zod';

export const EVENT_TYPES = [
  { value: 'private-dinner', label: 'Private dinner' },
  { value: 'party', label: 'Party' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'other', label: 'Something else' },
] as const;

export const BUDGET_RANGES = [
  { value: 'under-500', label: 'Under £500' },
  { value: '500-1500', label: '£500 – £1,500' },
  { value: '1500-5000', label: '£1,500 – £5,000' },
  { value: '5000-plus', label: '£5,000+' },
  { value: 'not-sure', label: 'Not sure yet' },
] as const;

export const INQUIRY_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'declined', label: 'Declined' },
  { value: 'archived', label: 'Archived' },
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]['value'];

const eventTypeValues = EVENT_TYPES.map((type) => type.value) as [string, ...string[]];
const budgetValues = BUDGET_RANGES.map((range) => range.value) as [string, ...string[]];
const statusValues = INQUIRY_STATUSES.map((status) => status.value) as [
  InquiryStatus,
  ...InquiryStatus[],
];

/**
 * Shared between the inquiry form (client) and /api/catering (server),
 * so both validate identically.
 */
export const cateringInquirySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().trim().email('Enter a valid email address').max(254),
  phone: z.string().trim().max(30, 'Keep it under 30 characters').optional().or(z.literal('')),
  eventType: z.enum(eventTypeValues, { message: 'Choose an event type' }),
  eventDate: z.coerce
    .date({ message: 'Choose a date' })
    .refine((date) => date.getTime() > Date.now(), 'The event date must be in the future'),
  guestCount: z.coerce
    .number({ message: 'How many guests?' })
    .int('Whole numbers only')
    .min(1, 'At least one guest')
    .max(2000, 'For events this size, email us directly'),
  location: z.string().trim().max(300).optional().or(z.literal('')),
  budgetRange: z.enum(budgetValues).optional().or(z.literal('')),
  dietaryRequirements: z.string().trim().max(1000).optional().or(z.literal('')),
  message: z.string().trim().max(4000).optional().or(z.literal('')),
});

export type CateringInquiryInput = z.infer<typeof cateringInquirySchema>;

/** Admin-only updates via PATCH /api/catering/[id]. */
export const cateringInquiryUpdateSchema = z
  .object({
    status: z.enum(statusValues).optional(),
    internalNotes: z.string().trim().max(4000, 'Keep notes under 4000 characters').optional(),
  })
  .refine((data) => data.status !== undefined || data.internalNotes !== undefined, {
    message: 'Provide a status or internal notes to update',
  });

export type CateringInquiryUpdateInput = z.infer<typeof cateringInquiryUpdateSchema>;
