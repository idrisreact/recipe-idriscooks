'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Plus, LogIn, Utensils, Archive, CheckCircle2 } from 'lucide-react';
import { authClient } from '@/src/utils/auth-client';
import { SignInModal } from '@/src/components/auth/sign-in-modal/SignInModal';
import { Heading } from '@/src/components/common/heading/heading';
import { Text } from '@/src/components/ui/Text';
import { VerticalSpace } from '@/src/components/ui/VerticalSpace';
import {
  DietaryPreferences,
  MealPlanStatus,
  useCreateMealPlan,
  useMealPlans,
  useUpdateMealPlan,
} from '@/src/hooks/use-meal-plans';

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

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function MealPlansPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const { data: plans = [], isLoading, error } = useMealPlans();
  const createMealPlan = useCreateMealPlan();
  const updateMealPlan = useUpdateMealPlan();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [servings, setServings] = useState(4);
  const [budget, setBudget] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreferences>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const currentWeekStart = useMemo(() => startOfWeekSunday(new Date()), []);
  const [weekStartInput, setWeekStartInput] = useState(toInputDate(currentWeekStart));

  const errorMessage = error instanceof Error ? error.message : null;

  const categorizedPlans = useMemo(() => {
    const thisWeek = startOfWeekSunday(new Date()).getTime();

    const activePlans = plans.filter((plan) => plan.status !== 'archived');
    const archivedPlans = plans.filter((plan) => plan.status === 'archived');

    const current = activePlans.filter((plan) => {
      const weekStart = startOfWeekSunday(new Date(plan.weekStartDate)).getTime();
      return weekStart === thisWeek;
    });

    const upcoming = activePlans.filter((plan) => {
      const weekStart = startOfWeekSunday(new Date(plan.weekStartDate)).getTime();
      return weekStart > thisWeek;
    });

    const past = activePlans.filter((plan) => {
      const weekStart = startOfWeekSunday(new Date(plan.weekStartDate)).getTime();
      return weekStart < thisWeek;
    });

    return { current, upcoming, past, archived: archivedPlans };
  }, [plans]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    try {
      const baseDate = new Date(`${weekStartInput}T00:00:00`);
      const normalized = startOfWeekSunday(baseDate);
      const planName = name.trim() || `Week of ${formatDateShort(normalized)}`;

      await createMealPlan.mutateAsync({
        name: planName,
        description: description.trim() || null,
        weekStartDate: normalized.toISOString(),
        servings,
        budget: budget === '' ? null : Number(budget),
        dietaryPreferences,
      });

      setName('');
      setDescription('');
      setBudget('');
      setServings(4);
      setDietaryPreferences({});
      setWeekStartInput(toInputDate(currentWeekStart));
      setShowCreate(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create meal plan');
    }
  };

  const togglePreference = (key: keyof DietaryPreferences) => {
    setDietaryPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleArchive = async (planId: string, nextStatus: MealPlanStatus) => {
    try {
      await updateMealPlan.mutateAsync({ id: planId, status: nextStatus });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update meal plan');
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
            Sign in to plan your week
          </Text>
          <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">
            Build meal plans, track progress, and keep your week on autopilot.
          </Text>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setShowSignInModal(true)}
              className="btn-ink flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              onClick={() => router.push('/recipes')}
              className="btn-outline flex items-center gap-2"
            >
              Browse Recipes
            </button>
          </div>
        </div>

        {showSignInModal && <SignInModal onClose={() => setShowSignInModal(false)} />}
      </div>
    );
  }

  const renderPlanSection = (title: string, plansToShow: typeof plans, emptyMessage: string) => (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-4 h-4 text-primary" />
        <Text as="h2" variant="subheading">
          {title}
        </Text>
      </div>

      {plansToShow.length === 0 ? (
        <Text variant="small" className="text-muted-foreground">
          {emptyMessage}
        </Text>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {plansToShow.map((plan) => {
            const weekStart = new Date(plan.weekStartDate);
            const completed = plan.completedCount || 0;
            const total = plan.itemsCount || 0;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
            const statusLabel =
              plan.status === 'archived'
                ? 'Archived'
                : plan.status === 'template'
                  ? 'Template'
                  : 'Active';

            const activePreferences = PREFERENCE_LABELS.filter(
              (pref) => plan.dietaryPreferences?.[pref.key]
            );

            return (
              <div key={plan.id} className="card-editorial p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatWeekRange(weekStart)}
                    </p>
                  </div>
                  <span className="text-xs uppercase tracking-wide text-white/60">
                    {statusLabel}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>
                      {completed}/{total || 0} meals cooked
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--primary)]" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {plan.budget && (
                    <span className="px-2 py-1 rounded-full bg-muted">Budget: ${plan.budget}</span>
                  )}
                  <span className="px-2 py-1 rounded-full bg-muted">
                    Serves {plan.servings ?? 1}
                  </span>
                  {activePreferences.map((pref) => (
                    <span key={pref.key} className="px-2 py-1 rounded-full bg-muted">
                      {pref.label}
                    </span>
                  ))}
                </div>

                <div className="mt-auto flex gap-3">
                  <button
                    onClick={() => router.push(`/meal-plans/${plan.id}`)}
                    className="btn-outline flex-1"
                  >
                    View Plan
                  </button>
                  <button
                    onClick={() =>
                      handleArchive(plan.id, plan.status === 'archived' ? 'active' : 'archived')
                    }
                    className="btn-outline flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    {plan.status === 'archived' ? 'Restore' : 'Archive'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="wrapper page">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <Heading title="Meal Plans" subTitle="Plan your week, keep momentum" />
          <button
            onClick={() => setShowCreate((prev) => !prev)}
            className="btn-ink flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {showCreate ? 'Close' : 'New Plan'}
          </button>
        </div>

        {showCreate && (
          <form onSubmit={handleCreate} className="card-editorial p-6 max-w-3xl">
            <h2 className="text-xl font-semibold text-primary mb-6">Create Meal Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Week of Feb 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Week Start (Sunday)
                  </label>
                  <input
                    type="date"
                    value={weekStartInput}
                    onChange={(event) => setWeekStartInput(event.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Busy week, focus on quick dinners."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Servings
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={servings}
                    onChange={(event) => setServings(Number(event.target.value) || 1)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weekly Budget (optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dietary Preferences
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PREFERENCE_LABELS.map((pref) => (
                      <label
                        key={pref.key}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={!!dietaryPreferences[pref.key]}
                          onChange={() => togglePreference(pref.key)}
                          className="h-4 w-4"
                        />
                        {pref.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {formError && <p className="text-sm text-destructive mt-4">{formError}</p>}

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={createMealPlan.isPending}
                className="btn-ink flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {createMealPlan.isPending ? 'Creating...' : 'Create Plan'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-outline">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <VerticalSpace space="16" />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card-editorial p-6 animate-pulse h-40" />
          ))}
        </div>
      ) : errorMessage ? (
        <div className="text-center">
          <Text as="h2" className="text-destructive mb-4" variant="subheading">
            Failed to load meal plans
          </Text>
          <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">
            {errorMessage}
          </Text>
          <button onClick={() => window.location.reload()} className="btn-ink">
            Try Again
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16">
          <Utensils className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <Text as="h2" variant="subheading" className="mb-4">
            No meal plans yet
          </Text>
          <Text variant="large" className="text-muted-foreground mb-8 max-w-md mx-auto">
            Create a plan to map out breakfasts, lunches, dinners, and snacks.
          </Text>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-ink flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Create Plan
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {renderPlanSection('This Week', categorizedPlans.current, 'No plans for this week yet.')}
          {renderPlanSection('Upcoming', categorizedPlans.upcoming, 'No upcoming plans scheduled.')}
          {renderPlanSection('Past Weeks', categorizedPlans.past, 'No past plans saved.')}
          {categorizedPlans.archived.length > 0 &&
            renderPlanSection('Archived', categorizedPlans.archived, 'No archived plans yet.')}
        </div>
      )}

      <VerticalSpace space="16" />

      <div className="card-editorial p-6">
        <div className="flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-primary" />
          <div>
            <Text as="h3" variant="subheading" className="mb-2">
              Stay consistent
            </Text>
            <Text className="text-muted-foreground">
              Check off meals as you cook them. The more you finish, the easier next week’s planning
              becomes.
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}
