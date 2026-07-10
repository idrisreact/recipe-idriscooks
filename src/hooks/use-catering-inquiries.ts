import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { InquiryStatus } from '@/src/lib/validations/catering';

/** A catering inquiry as serialized by the API (timestamps are ISO strings). */
export interface CateringInquiryRecord {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string | null;
  eventType: string;
  eventDate: string;
  guestCount: number;
  location: string | null;
  budgetRange: string | null;
  dietaryRequirements: string | null;
  message: string | null;
  status: InquiryStatus;
  internalNotes: string | null;
  metadata: { source?: string; utm?: Record<string, string> } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CateringInquiriesResponse {
  inquiries: CateringInquiryRecord[];
  counts: Partial<Record<InquiryStatus, number>>;
  total: number;
  page: number;
  pageSize: number;
}

const QUERY_KEY = 'catering-inquiries';

export function useCateringInquiries(status: InquiryStatus | null, page: number) {
  return useQuery<CateringInquiriesResponse>({
    queryKey: [QUERY_KEY, status ?? 'all', page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (page > 1) params.set('page', String(page));
      const response = await fetch(`/api/catering?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch inquiries');
      }
      return response.json();
    },
    placeholderData: (previous) => previous,
  });
}

interface UpdateInquiryVariables {
  id: string;
  status?: InquiryStatus;
  internalNotes?: string;
}

/** Cache snapshot taken before an optimistic update, for rollback on error. */
type InquiriesSnapshot = Array<
  readonly [readonly unknown[], CateringInquiriesResponse | undefined]
>;

export function useUpdateCateringInquiry() {
  const queryClient = useQueryClient();

  return useMutation<CateringInquiryRecord, Error, UpdateInquiryVariables, InquiriesSnapshot>({
    mutationFn: async ({ id, ...data }) => {
      const response = await fetch(`/api/catering/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update inquiry');
      }
      return response.json();
    },
    onMutate: async ({ id, ...data }) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEY] });
      const snapshot = queryClient.getQueriesData<CateringInquiriesResponse>({
        queryKey: [QUERY_KEY],
      });

      queryClient.setQueriesData<CateringInquiriesResponse>({ queryKey: [QUERY_KEY] }, (cached) =>
        cached
          ? {
              ...cached,
              inquiries: cached.inquiries.map((inquiry) =>
                inquiry.id === id ? { ...inquiry, ...data } : inquiry
              ),
            }
          : cached
      );

      return snapshot;
    },
    onError: (_error, _variables, snapshot) => {
      snapshot?.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
