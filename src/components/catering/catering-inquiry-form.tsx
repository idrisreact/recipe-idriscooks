'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  cateringInquirySchema,
  type CateringInquiryInput,
  EVENT_TYPES,
  BUDGET_RANGES,
} from '@/src/lib/validations/catering';

export const CateringInquiryForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CateringInquiryInput>({
    resolver: zodResolver(cateringInquirySchema),
  });

  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: CateringInquiryInput) => {
    setServerError(null);
    try {
      const res = await fetch('/api/catering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Failed to submit inquiry');
      }
      setSent(true);
      reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to submit inquiry');
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-6 py-10">
        <span className="eyebrow-rule">Inquiry received</span>
        <h3 className="font-serif text-4xl md:text-5xl leading-tight text-[var(--ink)]">
          The kitchen is <span className="italic text-[var(--tomato)]">reading</span>.
        </h3>
        <p className="body-lg text-[var(--ink-65)] max-w-md">
          Thank you — your inquiry is in. Expect a reply within two working days to talk menus,
          logistics and a quote.
        </p>
        <button type="button" onClick={() => setSent(false)} className="btn-link">
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10" noValidate>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <label htmlFor="catering-name" className="field-label">
            Name
          </label>
          <input
            id="catering-name"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            aria-invalid={!!errors.name}
            className="field-input"
            {...register('name')}
          />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="catering-email" className="field-label">
            Email
          </label>
          <input
            id="catering-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            className="field-input"
            {...register('email')}
          />
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="catering-phone" className="field-label">
            Phone <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="catering-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+44…"
            aria-invalid={!!errors.phone}
            className="field-input"
            {...register('phone')}
          />
          {errors.phone && <p className="field-error">{errors.phone.message}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="catering-event-type" className="field-label">
            Event type
          </label>
          <select
            id="catering-event-type"
            aria-invalid={!!errors.eventType}
            className="field-input bg-transparent"
            defaultValue=""
            {...register('eventType')}
          >
            <option value="" disabled>
              Choose…
            </option>
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.eventType && <p className="field-error">{errors.eventType.message}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="catering-date" className="field-label">
            Event date
          </label>
          <input
            id="catering-date"
            type="date"
            aria-invalid={!!errors.eventDate}
            className="field-input"
            {...register('eventDate')}
          />
          {errors.eventDate && <p className="field-error">{errors.eventDate.message}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="catering-guests" className="field-label">
            Guest count
          </label>
          <input
            id="catering-guests"
            type="number"
            min={1}
            placeholder="24"
            aria-invalid={!!errors.guestCount}
            className="field-input"
            {...register('guestCount')}
          />
          {errors.guestCount && <p className="field-error">{errors.guestCount.message}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="catering-location" className="field-label">
            Location <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="catering-location"
            type="text"
            placeholder="Venue or postcode"
            aria-invalid={!!errors.location}
            className="field-input"
            {...register('location')}
          />
          {errors.location && <p className="field-error">{errors.location.message}</p>}
        </div>

        <div className="flex flex-col gap-3">
          <label htmlFor="catering-budget" className="field-label">
            Budget <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <select
            id="catering-budget"
            className="field-input bg-transparent"
            defaultValue=""
            {...register('budgetRange')}
          >
            <option value="">Not sure yet</option>
            {BUDGET_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="catering-dietary" className="field-label">
          Dietary requirements <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="catering-dietary"
          type="text"
          placeholder="Allergies, vegetarian counts, anything we should know"
          aria-invalid={!!errors.dietaryRequirements}
          className="field-input"
          {...register('dietaryRequirements')}
        />
        {errors.dietaryRequirements && (
          <p className="field-error">{errors.dietaryRequirements.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="catering-message" className="field-label">
          About the event <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="catering-message"
          rows={5}
          placeholder="The occasion, the mood, dishes you have in mind…"
          aria-invalid={!!errors.message}
          className="field-input resize-y min-h-[120px]"
          {...register('message')}
        />
        {errors.message && <p className="field-error">{errors.message.message}</p>}
      </div>

      {serverError && (
        <p className="field-error border-l-2 border-[var(--tomato)] pl-4">{serverError}</p>
      )}

      <button type="submit" className="btn-tomato self-start" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send inquiry'}
      </button>
    </form>
  );
};
