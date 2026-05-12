'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Archive,
  CalendarDays,
  CheckCircle2,
  LogIn,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { authClient } from '@/src/utils/auth-client';
import { SignInModal } from '@/src/components/auth/sign-in-modal/SignInModal';
import { Heading } from '@/src/components/common/heading/heading';
import { Text } from '@/src/components/ui/Text';
import { VerticalSpace } from '@/src/components/ui/VerticalSpace';
import {
  DietaryPreferences,
  MealPlanItem,
  MealPlanStatus,
  MealType,
  useAddMealPlanItem,
  useDeleteMealPlan,
  useMealPlan,
  useRemoveMealPlanItem,
  useUpdateMealPlan,
  useUpdateMealPlanItem,
} from '@/src/hooks/use-meal-plans';
import type { Recipe } from '@/src/types/recipes.types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_TYPES: Array<{ key: MealType; label: string }> = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
];

const PREFERENCE_LABELS: Array<{ key: keyof DietaryPreferences; label: string }> = [
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'glutenFree', label: 'Gluten Free' },
  { key: 'dairyFree', label: 'Dairy Free' },
  { key: 'lowCarb', label: 'Low Carb' },
  { key: 'keto', label: 'Keto' },
  { key: 'paleo', label: 'Paleo' },
];

function startOfWeekSunday(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  return copy;
}

function formatDateShort(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatWeekRange(startDate: Date) {
  const end = new Date(startDate);
  end.setDate(end.getDate() + 6);
  return `${formatDateShort(startDate)} – ${formatDateShort(end)}`;
}

export default function MealPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params?.id as string;

  const { data: session, isPending } = authClient.useSession();
  const { data, isLoading, error } = useMealPlan(planId);
  const addItem = useAddMealPlanItem();
  const removeItem = useRemoveMealPlanItem();
  const updateItem = useUpdateMealPlanItem();
  const updatePlan = useUpdateMealPlan();
  const deletePlan = useDeleteMealPlan();

  const [showSignInModal, setShowSignInModal] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    dayOfWeek: number;
    mealType: MealType;
  } | null>(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Recipe[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const plan = data?.plan;
  const items = data?.items ?? [];

  const itemsBySlot = useMemo(() => {
    const map = new Map<string, MealPlanItem>();
    items.forEach((item) => {
      map.set(`${item.dayOfWeek}-${item.mealType}`, item);
    });
    return map;
  }, [items]);

  const weekStart = plan ? new Date(plan.weekStartDate) : null;
  const weekRange = weekStart ? formatWeekRange(weekStart) : '';

  const progress = useMemo(() => {
    if (!items.length) return 0;
    const completed = items.filter((item) => item.isCompleted).length;
    return Math.round((completed / items.length) * 100);
  }, [items]);

  useEffect(() => {
    if (!pickerOpen) return;

    const controller = new AbortController();
    const query = search.trim();

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError(null);

        const params = new URLSearchParams({ limit: '8' });
        if (query) params.set('search', query);
        const response = await fetch(`/api/recipes?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorBody = await response.json();
          throw new Error(errorBody.error || 'Failed to fetch recipes');
        }

        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setSearchError(err instanceof Error ? err.message : 'Failed to fetch recipes');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [search, pickerOpen]);

  const openPicker = (dayOfWeek: number, mealType: MealType) => {
    setSelectedSlot({ dayOfWeek, mealType });
    setSearch('');
    setPickerOpen(true);
  };

  const closePicker = () => {
    setPickerOpen(false);
    setSelectedSlot(null);
  };

  const handleAddRecipe = async (recipeId: number) => {
    if (!selectedSlot) return;

    try {
      await addItem.mutateAsync({
        planId,
        recipeId,
        dayOfWeek: selectedSlot.dayOfWeek,
        mealType: selectedSlot.mealType,
      });
      closePicker();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to add recipe');
    }
  };

  const handleRemove = async (item: MealPlanItem) => {
    const confirmed = window.confirm(`Remove ${item.recipe.title} from this plan?`);
    if (!confirmed) return;

    try {
      await removeItem.mutateAsync({ itemId: item.id, planId });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to remove recipe');
    }
  };

  const handleToggleCompleted = async (item: MealPlanItem) => {
    try {
      await updateItem.mutateAsync({
        itemId: item.id,
        planId,
        isCompleted: !item.isCompleted,
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update meal');
    }
  };

  const handleArchive = async () => {
    if (!plan) return;
    const nextStatus: MealPlanStatus = plan.status === 'archived' ? 'active' : 'archived';

    try {
      await updatePlan.mutateAsync({ id: plan.id, status: nextStatus });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update plan');
    }
  };

  const handleDeletePlan = async () => {
    if (!plan) return;
    const confirmed = window.confirm(`Delete "${plan.name}"? This can’t be undone.`);
    if (!confirmed) return;

    try {
      await deletePlan.mutateAsync(plan.id);
      router.push('/meal-plans');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete plan');
    }
  };

  if (isPending) {
    return (
      <div className="wrapper page">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-4"></div>
            <Text>Loading...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="wrapper page">
        <div className="text-center py-16">
          <LogIn className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <Text as="h1" variant="heading" className="mb-4">
            Sign in to view this plan
          </Text>
          <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">
            Meal plans help you keep your week on track.
          </Text>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowSignInModal(true)}
              className="murakamicity-button flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => router.push('/meal-plans')}
              className="murakamicity-button-outline flex items-center gap-2"
            >
              Back to Plans
            </button>
          </div>
        </div>

        {showSignInModal && <SignInModal onClose={() => setShowSignInModal(false)} />}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="wrapper page">
        <div className="murakamicity-card p-6 animate-pulse h-40" />
      </div>
    );
  }

  if (error instanceof Error) {
    return (
      <div className="wrapper page text-center">
        <Text as="h2" className="text-destructive mb-4" variant="subheading">
          Failed to load plan
        </Text>
        <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">
          {error.message}
        </Text>
        <button onClick={() => router.push('/meal-plans')} className="murakamicity-button">
          Back to Plans
        </button>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="wrapper page text-center">
        <Text as="h2" className="text-muted-foreground mb-4" variant="subheading">
          Meal plan not found
        </Text>
        <button onClick={() => router.push('/meal-plans')} className="murakamicity-button">
          Back to Plans
        </button>
      </div>
    );
  }

  const activePreferences = PREFERENCE_LABELS.filter((pref) => plan.dietaryPreferences?.[pref.key]);

  const isCurrentWeek = weekStart
    ? startOfWeekSunday(new Date()).getTime() === startOfWeekSunday(weekStart).getTime()
    : false;

  return (
    <div className="wrapper page">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={() => router.push('/meal-plans')}
          className="murakamicity-button-outline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </button>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleArchive}
            className="murakamicity-button-outline flex items-center gap-2"
          >
            <Archive className="w-4 h-4" />
            {plan.status === 'archived' ? 'Restore Plan' : 'Archive Plan'}
          </button>
          <button
            onClick={handleDeletePlan}
            className="murakamicity-button-outline flex items-center gap-2 text-destructive border-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      <VerticalSpace space="12" />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <Heading title={plan.name} subTitle={weekRange} />
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          {isCurrentWeek ? 'This week' : 'Scheduled'}
        </div>
      </div>

      <VerticalSpace space="8" />

      <div className="murakamicity-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Text as="h3" variant="subheading">
              Progress
            </Text>
            <Text variant="small" className="text-muted-foreground">
              {items.filter((item) => item.isCompleted).length}/{items.length} meals completed
            </Text>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            {progress}%
          </div>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden mt-4">
          <div className="h-full bg-[var(--primary)]" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <VerticalSpace space="12" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="murakamicity-card p-6 md:col-span-2">
          <Text as="h3" variant="subheading" className="mb-4">
            Plan Details
          </Text>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="px-3 py-1 rounded-full bg-muted">Serves {plan.servings ?? 1}</span>
            {plan.budget && (
              <span className="px-3 py-1 rounded-full bg-muted">Budget ${plan.budget}</span>
            )}
            {activePreferences.length === 0 ? (
              <span className="px-3 py-1 rounded-full bg-muted">No dietary filters</span>
            ) : (
              activePreferences.map((pref) => (
                <span key={pref.key} className="px-3 py-1 rounded-full bg-muted">
                  {pref.label}
                </span>
              ))
            )}
          </div>
          {plan.description && (
            <Text variant="small" className="text-muted-foreground mt-4">
              {plan.description}
            </Text>
          )}
        </div>
        <div className="murakamicity-card p-6">
          <Text as="h3" variant="subheading" className="mb-4">
            Quick Tips
          </Text>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>Plan your busiest night first.</li>
            <li>Batch cook lunch prep on Sunday.</li>
            <li>Check off meals to build momentum.</li>
          </ul>
        </div>
      </div>

      <VerticalSpace space="16" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-4">
        {DAYS.map((day, dayIndex) => {
          const todayIndex = new Date().getDay();
          const highlight = isCurrentWeek && dayIndex === todayIndex;

          return (
            <div
              key={day}
              className={`murakamicity-card p-4 flex flex-col gap-4 ${
                highlight ? 'border border-primary' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <Text as="h4" variant="small" weight="semibold">
                  {day}
                </Text>
                {highlight && (
                  <span className="text-xs uppercase tracking-wide text-primary">Today</span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {MEAL_TYPES.map((meal) => {
                  const slotKey = `${dayIndex}-${meal.key}`;
                  const item = itemsBySlot.get(slotKey);

                  return (
                    <div key={meal.key} className="border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Text variant="xs" className="text-muted-foreground uppercase tracking-wide">
                          {meal.label}
                        </Text>
                        {item && (
                          <button
                            onClick={() => handleToggleCompleted(item)}
                            className={`text-xs px-2 py-1 rounded-full border ${
                              item.isCompleted
                                ? 'border-primary text-primary'
                                : 'border-border text-muted-foreground'
                            }`}
                          >
                            {item.isCompleted ? 'Cooked' : 'Mark cooked'}
                          </button>
                        )}
                      </div>

                      {item ? (
                        <div className="flex flex-col gap-2">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {item.recipe.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.recipe.cookTime} min • Serves {item.recipe.servings}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/recipes/category/${item.recipe.title}`)}
                              className="text-xs text-primary hover:underline"
                            >
                              View recipe
                            </button>
                            <button
                              onClick={() => handleRemove(item)}
                              className="text-xs text-destructive hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openPicker(dayIndex, meal.key)}
                          className="w-full text-xs text-primary flex items-center gap-2 justify-center py-2 border border-dashed border-primary/40 rounded-md hover:bg-primary/5"
                        >
                          <Plus className="w-3 h-3" />
                          Add recipe
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={closePicker} />
          <div className="relative bg-white text-gray-900 rounded-xl shadow-xl w-full max-w-2xl p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <Text as="h3" variant="subheading">
                Add Recipe
              </Text>
              <button
                onClick={closePicker}
                className="text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search recipes"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {isSearching ? (
              <div className="text-center py-6 text-muted-foreground">Searching...</div>
            ) : searchError ? (
              <div className="text-center py-6 text-destructive">{searchError}</div>
            ) : results.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">No recipes found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto">
                {results.map((recipe) => (
                  <button
                    key={recipe.id}
                    onClick={() => handleAddRecipe(recipe.id)}
                    className="border border-border rounded-lg p-3 text-left hover:border-primary transition-colors"
                  >
                    <p className="text-sm font-medium text-foreground">{recipe.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {recipe.cookTime} min • Serves {recipe.servings}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {recipe.description}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
