'use client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/src/components/ui/Text';
import { VerticalSpace } from '@/src/components/ui/VerticalSpace';
import { Grid, List, Filter, X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

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
    <div className="mx-auto lg:w-4xl">
      {}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4 mb-6">
        {}
        <Form {...form}>
          <form action="" onSubmit={(e) => e.preventDefault()} className="flex-1 max-w-md">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-2xl">Search for recipes</FormLabel>
                  <VerticalSpace space="2" />
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Search for recipes..."
                        {...field}
                        value={search}
                        onChange={(e) => {
                          field.onChange(e);
                          onSearchChange(e.target.value);
                        }}
                      />
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange('');
                            onSearchChange('');
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>

        {}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {}
        <div className="flex-shrink-0">
          <Button variant="outline" onClick={onToggleFilters} className="w-full md:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          {}
          <div className="mb-4">
            <Text className="font-medium mb-2">Sort by:</Text>
            <div className="flex gap-2 flex-wrap">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onSortChange(option.value as SortOption)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {}
          {allTags.length > 0 && (
            <div>
              <Text className="font-medium mb-2">Filter by tags:</Text>
              <div className="flex gap-2 flex-wrap">
                {allTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTagToggle(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {}
      <div className="mb-4">
        <Text className="text-gray-600">
          {resultsCount} recipe{resultsCount !== 1 ? 's' : ''} found
          {search && ` for "${search}"`}
        </Text>
      </div>
    </div>
  );
}
