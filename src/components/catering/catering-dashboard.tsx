'use client';

import { useState } from 'react';
import { PageHeader } from '@/src/components/ui/page-header';
import { EmptyState } from '@/src/components/ui/empty-state';
import { Skeleton } from '@/src/components/ui/skeleton';
import { INQUIRY_STATUSES, type InquiryStatus } from '@/src/lib/validations/catering';
import { useCateringInquiries } from '@/src/hooks/use-catering-inquiries';
import { InquiryRow } from './inquiry-row';

const InquiryListSkeleton = () => (
  <div className="flex flex-col" role="status" aria-label="Loading inquiries">
    {Array.from({ length: 5 }).map((_, index) => (
      <div key={index} className="flex items-center gap-6 border-t border-[var(--ink-line)] py-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="ml-auto h-9 w-32" />
      </div>
    ))}
  </div>
);

export const CateringDashboard = () => {
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | null>(null);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useCateringInquiries(statusFilter, page);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const allCount = data
    ? Object.values(data.counts).reduce((sum, value) => sum + (value ?? 0), 0)
    : 0;

  const selectFilter = (status: InquiryStatus | null) => {
    setStatusFilter(status);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Admin"
        title="Catering inquiries"
        description="Every inquiry from the catering page, newest first. Update the status as you work each lead and keep notes only you can see."
        aside={
          data && (
            <span className="mono-label text-[var(--ink-65)]">
              {allCount} {allCount === 1 ? 'inquiry' : 'inquiries'}
            </span>
          )
        }
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
        <button
          type="button"
          onClick={() => selectFilter(null)}
          aria-pressed={statusFilter === null}
          className={`chip ${statusFilter === null ? 'chip-active' : ''}`}
        >
          All&ensp;{allCount}
        </button>
        {INQUIRY_STATUSES.map((status) => (
          <button
            key={status.value}
            type="button"
            onClick={() => selectFilter(status.value)}
            aria-pressed={statusFilter === status.value}
            className={`chip ${statusFilter === status.value ? 'chip-active' : ''}`}
          >
            {status.label}&ensp;{data?.counts[status.value] ?? 0}
          </button>
        ))}
      </div>

      {isLoading && <InquiryListSkeleton />}

      {isError && (
        <EmptyState
          eyebrow="Something broke"
          title="Couldn't load inquiries"
          description={error instanceof Error ? error.message : 'An unexpected error occurred.'}
          action={
            <button type="button" onClick={() => refetch()} className="btn-ink">
              Try again
            </button>
          }
        />
      )}

      {data && data.inquiries.length === 0 && (
        <EmptyState
          eyebrow="All quiet"
          title={statusFilter ? 'Nothing with this status' : 'No inquiries yet'}
          description={
            statusFilter
              ? 'Try another status, or view all inquiries.'
              : 'New catering inquiries will land here the moment they come in.'
          }
        />
      )}

      {data && data.inquiries.length > 0 && (
        <>
          <ul className="flex flex-col border-b border-[var(--ink-line)]">
            {data.inquiries.map((inquiry) => (
              <InquiryRow key={inquiry.id} inquiry={inquiry} />
            ))}
          </ul>

          {totalPages > 1 && (
            <nav className="flex items-center justify-between" aria-label="Pagination">
              <button
                type="button"
                onClick={() => setPage((current) => current - 1)}
                disabled={page <= 1}
                className="btn-link disabled:pointer-events-none disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="mono-label text-[var(--ink-65)]">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= totalPages}
                className="btn-link disabled:pointer-events-none disabled:opacity-40"
              >
                Next →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
};
