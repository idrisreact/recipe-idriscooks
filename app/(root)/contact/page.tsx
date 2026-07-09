'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactInput } from '@/src/lib/validations/contact';

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: ContactInput) => {
    setServerError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Failed to send message');
      }
      setSent(true);
      reset();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  return (
    <div className="wrapper page">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
        {/* Left: editorial statement */}
        <div className="flex flex-col gap-8 lg:sticky lg:top-32">
          <span className="eyebrow-rule">Correspondence</span>
          <h1 className="display-l">
            Write to the <span className="italic text-[var(--tomato)]">kitchen</span>
          </h1>
          <p className="body-lg text-[var(--ink-65)] max-w-md">
            Questions about a recipe, an idea worth cooking, or something that didn&apos;t work the
            way it should — it all gets read, and it all gets answered.
          </p>
          <div className="divider max-w-md" />
          <dl className="flex flex-col gap-4 max-w-md">
            <div className="flex items-baseline justify-between gap-6">
              <dt className="eyebrow">Replies</dt>
              <dd className="text-sm text-[var(--ink-75)]">Usually within two days</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6">
              <dt className="eyebrow">Catering</dt>
              <dd className="text-sm text-[var(--ink-75)]">Use the catering inquiry for events</dd>
            </div>
          </dl>
        </div>

        {/* Right: form */}
        <div className="border-t border-[var(--ink)] pt-10">
          {sent ? (
            <div className="flex flex-col items-start gap-6 py-10">
              <span className="eyebrow-rule">Message sent</span>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight text-[var(--ink)]">
                In the <span className="italic text-[var(--tomato)]">inbox</span>. Thank you.
              </h2>
              <p className="body-lg text-[var(--ink-65)] max-w-md">
                Your note is on its way. Expect a reply within a couple of days.
              </p>
              <button type="button" onClick={() => setSent(false)} className="btn-link">
                Write another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10" noValidate>
              <div className="flex flex-col gap-3">
                <label htmlFor="contact-name" className="field-label">
                  Name
                </label>
                <input
                  id="contact-name"
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
                <label htmlFor="contact-email" className="field-label">
                  Email
                </label>
                <input
                  id="contact-email"
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
                <label htmlFor="contact-message" className="field-label">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={6}
                  placeholder="What's on your mind?"
                  aria-invalid={!!errors.message}
                  className="field-input resize-y min-h-[140px]"
                  {...register('message')}
                />
                {errors.message && <p className="field-error">{errors.message.message}</p>}
              </div>

              {serverError && (
                <p className="field-error border-l-2 border-[var(--tomato)] pl-4">{serverError}</p>
              )}

              <button type="submit" className="btn-ink self-start" disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
