'use client';

import { Input } from '@/components/ui/input';
import { Grid, List, SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { motion, AnimatePresence } from 'framer-motion';

type FormValues = {
  search: string;
};

type SortOption = 'newest' | 'oldest' | 'title' | 'cookTime' | 'servings';
type ViewMode = 'grid' | 'list';

const formSchema = z.object({
  search: z.string().min(3, 'must be more than 3 letters long'),
});

interface RecipeFiltersProps {
  search: string;
  onSearchChange: (search: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  allTags: string[];
  showFilters: boolean;
  onToggleFilters: () => void;
  resultsCount: number;
}

export function RecipeFilters({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  selectedTags,
  onTagToggle,
  allTags,
  showFilters,
  onToggleFilters,
  resultsCount,
}: RecipeFiltersProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: '',
    },
  });

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'title', label: 'Title' },
    { value: 'cookTime', label: 'Cook Time' },
    { value: 'servings', label: 'Servings' },
  ];

  return (
    <div className="mb-12">
      <div className="mb-8">
        <motion.span
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="eyebrow mb-4 block"
        >
          Search
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="subhead mb-6"
        >
          Find Your Recipe
        </motion.h2>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="max-w-2xl">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--ink-50)] group-focus-within:text-[var(--tomato)] transition-colors" />
                      <Input
                        placeholder="Search recipes by name, ingredient, or cuisine..."
                        {...field}
                        value={search}
                        onChange={(e) => {
                          field.onChange(e);
                          onSearchChange(e.target.value);
                        }}
                        className="w-full h-14 rounded-none border-[var(--ink)] bg-transparent pl-14 pr-12 text-base text-[var(--ink)] placeholder:text-[var(--ink-50)] focus:border-[var(--tomato)] focus:ring-[var(--tomato)]/20"
                      />
                      {search && (
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange('');
                            onSearchChange('');
                          }}
                          className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-[var(--ink-50)] transition-colors hover:text-[var(--tomato)]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--ink)]">
        <div className="flex items-center gap-6">
          <span className="text-sm text-[var(--ink-60)]">
            <span className="font-medium text-[var(--ink)]">{resultsCount}</span> recipe
            {resultsCount !== 1 ? 's' : ''}
            {search && (
              <span className="text-[var(--ink-50)]">
                {' '}for &ldquo;<span className="text-[var(--tomato)]">{search}</span>&rdquo;
              </span>
            )}
          </span>

          <button
            onClick={onToggleFilters}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium uppercase tracking-[0.08em] transition-all ${
              showFilters
                ? 'bg-[var(--ink)] text-[var(--cream)]'
                : 'border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--parchment)]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        <div className="flex w-fit items-center gap-1 border border-[var(--ink)] p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-[var(--ink)] text-[var(--cream)]'
                : 'text-[var(--ink-50)] hover:bg-[var(--parchment)] hover:text-[var(--ink)]'
            }`}
            aria-label="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2.5 transition-all ${
              viewMode === 'list'
                ? 'bg-[var(--ink)] text-[var(--cream)]'
                : 'text-[var(--ink-50)] hover:bg-[var(--parchment)] hover:text-[var(--ink)]'
            }`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="py-8 space-y-8">
              <div>
                <span className="caption mb-4 block">Sort by</span>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onSortChange(option.value as SortOption)}
                      className={`px-4 py-2 text-sm font-medium uppercase tracking-[0.06em] transition-all ${
                        sortBy === option.value
                          ? 'bg-[var(--ink)] text-[var(--cream)]'
                          : 'border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--parchment)]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {allTags.length > 0 && (
                <div>
                  <span className="caption mb-4 block">Filter by category</span>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => onTagToggle(tag)}
                        className={`px-4 py-2 text-sm font-medium transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-[var(--ink)] text-[var(--cream)]'
                            : 'border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--parchment)]'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedTags.length > 0 && (
                <div className="flex items-center gap-3 border-t border-[var(--ink-line)] pt-4">
                  <span className="text-xs uppercase tracking-wider text-[var(--ink-50)]">
                    Active:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => onTagToggle(tag)}
                        className="flex items-center gap-2 border border-[var(--tomato)] px-3 py-1.5 text-xs font-medium text-[var(--tomato)] transition-colors hover:bg-[var(--tomato)] hover:text-[var(--cream)]"
                      >
                        {tag}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
