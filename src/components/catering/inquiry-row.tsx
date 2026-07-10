'use client';

import { useState, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import {
  BUDGET_RANGES,
  EVENT_TYPES,
  INQUIRY_STATUSES,
  type InquiryStatus,
} from '@/src/lib/validations/catering';
import {
  useUpdateCateringInquiry,
  type CateringInquiryRecord,
} from '@/src/hooks/use-catering-inquiries';

const eventTypeLabels: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((type) => [type.value, type.label])
);
const budgetLabels: Record<string, string> = Object.fromEntries(
  BUDGET_RANGES.map((range) => [range.value, range.label])
);

/** Flat square indicators — tomato demands attention, muted means closed out. */
const statusColors: Record<InquiryStatus, string> = {
  new: 'var(--tomato)',
  contacted: 'var(--peach)',
  quoted: 'var(--olive)',
  confirmed: 'var(--ink)',
  declined: 'rgba(28, 26, 23, 0.3)',
  archived: 'rgba(28, 26, 23, 0.3)',
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(value)
  );

const DetailItem = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <dt className="field-label">{label}</dt>
    <dd className="body">{children}</dd>
  </div>
);

const InquiryNotes = ({ inquiry }: { inquiry: CateringInquiryRecord }) => {
  const [notes, setNotes] = useState(inquiry.internalNotes ?? '');
  const updateInquiry = useUpdateCateringInquiry();
  const isDirty = notes.trim() !== (inquiry.internalNotes ?? '');

  const handleSave = () => {
    updateInquiry.mutate(
      { id: inquiry.id, internalNotes: notes.trim() },
      {
        onSuccess: () => toast.success('Notes saved'),
        onError: (error) => toast.error(error.message),
      }
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={`notes-${inquiry.id}`} className="field-label">
        Internal notes
      </label>
      <textarea
        id={`notes-${inquiry.id}`}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        rows={3}
        maxLength={4000}
        placeholder="Quoted £—, awaiting reply…"
        className="field-input resize-y"
      />
      <div>
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || updateInquiry.isPending}
          className="btn-ink px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {updateInquiry.isPending ? 'Saving…' : 'Save notes'}
        </button>
      </div>
    </div>
  );
};

interface InquiryRowProps {
  inquiry: CateringInquiryRecord;
}

export const InquiryRow = ({ inquiry }: InquiryRowProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const updateInquiry = useUpdateCateringInquiry();

  const handleStatusChange = (status: InquiryStatus) => {
    updateInquiry.mutate(
      { id: inquiry.id, status },
      { onError: (error) => toast.error(error.message) }
    );
  };

  return (
    <li className="border-t border-[var(--ink-line)]">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-5">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          className="group flex min-w-0 flex-1 flex-wrap items-baseline gap-x-6 gap-y-1 text-left"
        >
          <span className="font-serif text-2xl leading-tight text-[var(--ink)] group-hover:text-[var(--tomato)] transition-colors">
            {inquiry.name}
          </span>
          <span className="body-sm">
            {eventTypeLabels[inquiry.eventType] ?? inquiry.eventType} · {inquiry.guestCount} guests
            · {formatDate(inquiry.eventDate)}
          </span>
          <span className="mono-label ml-auto hidden text-[var(--ink-65)] sm:inline">
            {isOpen ? 'Close' : 'Details'}
          </span>
        </button>

        <label className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 shrink-0"
            style={{ background: statusColors[inquiry.status] }}
          />
          <span className="sr-only">Status for {inquiry.name}</span>
          <select
            value={inquiry.status}
            onChange={(event) => handleStatusChange(event.target.value as InquiryStatus)}
            disabled={updateInquiry.isPending}
            className="cursor-pointer border border-[var(--ink-line)] bg-transparent px-3 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.15em] text-[var(--ink)] transition-colors focus:border-[var(--ink)] focus:outline-none disabled:cursor-wait disabled:opacity-60"
          >
            {INQUIRY_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isOpen && (
        <div className="flex flex-col gap-8 border-t border-[var(--ink-line)] bg-[var(--parchment)]/40 px-4 py-8 md:px-6">
          <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Contact">
              <a href={`mailto:${inquiry.email}`} className="btn-link">
                {inquiry.email}
              </a>
              {inquiry.phone && (
                <>
                  <br />
                  <a href={`tel:${inquiry.phone}`} className="btn-link">
                    {inquiry.phone}
                  </a>
                </>
              )}
            </DetailItem>
            <DetailItem label="Event date">{formatDate(inquiry.eventDate)}</DetailItem>
            <DetailItem label="Guests">{inquiry.guestCount}</DetailItem>
            {inquiry.location && <DetailItem label="Location">{inquiry.location}</DetailItem>}
            {inquiry.budgetRange && (
              <DetailItem label="Budget">
                {budgetLabels[inquiry.budgetRange] ?? inquiry.budgetRange}
              </DetailItem>
            )}
            <DetailItem label="Received">{formatDate(inquiry.createdAt)}</DetailItem>
            {inquiry.dietaryRequirements && (
              <DetailItem label="Dietary requirements">{inquiry.dietaryRequirements}</DetailItem>
            )}
            {inquiry.message && (
              <div className="sm:col-span-2 lg:col-span-3">
                <DetailItem label="Message">
                  <span className="whitespace-pre-line">{inquiry.message}</span>
                </DetailItem>
              </div>
            )}
          </dl>

          <InquiryNotes inquiry={inquiry} />
        </div>
      )}
    </li>
  );
};
