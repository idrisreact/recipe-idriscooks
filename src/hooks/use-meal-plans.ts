import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/components/auth/auth-components';
import { Recipe } from '@/src/types/recipes.types';

export type MealPlanStatus = 'active' | 'archived' | 'template';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface DietaryPreferences {
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  lowCarb?: boolean;
  keto?: boolean;
  paleo?: boolean;
  allergies?: string[];
}

export interface MealPlanSummary {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  weekStartDate: string;
  status: MealPlanStatus;
  isTemplate: boolean;
  servings: number;
  dietaryPreferences?: DietaryPreferences | null;
  budget?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  itemsCount?: number;
  completedCount?: number;
}

export interface MealPlanItem {
  id: string;
  mealPlanId: string;
  recipeId: number;
  dayOfWeek: number;
  mealType: MealType;
  servings: number;
  notes?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  sortOrder: number;
  createdAt: string;
  recipe: Recipe;
}

export interface MealPlanDetailResponse {
  plan: MealPlanSummary;
  items: MealPlanItem[];
}

export function useMealPlans(status?: MealPlanStatus) {
  const { session } = useAuth();

  return useQuery<MealPlanSummary[]>({
    queryKey: ['meal-plans', status ?? 'all'],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      const response = await fetch(`/api/meal-plans?${params.toString()}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch meal plans');
      }
      return response.json();
    },
    enabled: !!session,
  });
}

export function useMealPlan(planId: string) {
  const { session } = useAuth();

  return useQuery<MealPlanDetailResponse>({
    queryKey: ['meal-plan', planId],
    queryFn: async () => {
      const response = await fetch(`/api/meal-plans/${planId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch meal plan');
      }
      return response.json();
    },
    enabled: !!session && !!planId,
  });
}

export function useCreateMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name?: string;
      description?: string | null;
      weekStartDate: string;
      servings?: number;
      budget?: string | number | null;
      dietaryPreferences?: DietaryPreferences;
    }) => {
      const response = await fetch('/api/meal-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create meal plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
  });
}

export function useUpdateMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<{
      name: string;
      description: string | null;
      weekStartDate: string;
      status: MealPlanStatus;
      servings: number;
      budget: string | number | null;
      dietaryPreferences: DietaryPreferences;
    }>) => {
      const response = await fetch(`/api/meal-plans/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update meal plan');
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      queryClient.invalidateQueries({ queryKey: ['meal-plan', variables.id] });
    },
  });
}

export function useDeleteMealPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch(`/api/meal-plans/${planId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete meal plan');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
  });
}

export function useAddMealPlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      planId: string;
      recipeId: number;
      dayOfWeek: number;
      mealType: MealType;
      servings?: number;
      notes?: string;
    }) => {
      const response = await fetch(`/api/meal-plans/${data.planId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeId: data.recipeId,
          dayOfWeek: data.dayOfWeek,
          mealType: data.mealType,
          servings: data.servings,
          notes: data.notes,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add recipe to meal plan');
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan', variables.planId] });
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
  });
}

export function useUpdateMealPlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, planId: _planId, ...data }: { itemId: string; planId: string } & Partial<{
      isCompleted: boolean;
      servings: number;
      notes: string | null;
    }>) => {
      const response = await fetch(`/api/meal-plans/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update meal plan item');
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan', variables.planId] });
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
  });
}

export function useRemoveMealPlanItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, planId }: { itemId: string; planId: string }) => {
      const response = await fetch(`/api/meal-plans/items/${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove meal plan item');
      }
      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['meal-plan', variables.planId] });
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
    },
  });
}
