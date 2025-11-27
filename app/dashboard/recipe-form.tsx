'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UploadButton } from '@/src/utils/uploadthing';
import { createRecipe, updateRecipe } from './actions';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const recipeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  imageUrl: z.string().url('Please upload an image'),
  servings: z.number().min(1, 'Must serve at least 1 person'),
  prepTime: z.number().min(1, 'Prep time must be at least 1 minute'),
  cookTime: z.number().min(0, 'Cook time cannot be negative'),
  ingredients: z.array(
    z.object({
      name: z.string().min(1, 'Ingredient name is required'),
      quantity: z.number().min(0, 'Quantity cannot be negative'),
      unit: z.string().min(1, 'Unit is required'),
    })
  ).min(1, 'Add at least one ingredient'),
  steps: z.array(z.object({ value: z.string().min(5, 'Step description is too short') })).min(1, 'Add at least one step'),
  tags: z.array(z.string()).optional(),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

interface RecipeFormProps {
  initialData?: RecipeFormValues;
  recipeId?: number;
}

export default function RecipeForm({ initialData, recipeId }: RecipeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: initialData || {
      servings: 2,
      prepTime: 15,
      cookTime: 30,
      ingredients: [{ name: '', quantity: 1, unit: 'cup' }],
      steps: [{ value: '' }],
      tags: [],
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
    control,
    name: 'steps',
  });

  const imageUrl = watch('imageUrl');
  const tags = watch('tags') || [];

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setValue('tags', [...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue(
      'tags',
      tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const onSubmit = async (data: RecipeFormValues) => {
    setIsSubmitting(true);
    try {
      const submissionData = {
        ...data,
        steps: data.steps.map((s) => s.value),
      };
      
      if (recipeId) {
        await updateRecipe(recipeId, submissionData);
        toast.success('Recipe updated successfully!');
      } else {
        await createRecipe(submissionData);
        toast.success('Recipe created successfully!');
      }
      
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(recipeId ? 'Failed to update recipe' : 'Failed to create recipe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Image Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Recipe Image</label>
        {imageUrl ? (
          <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
            <Image src={imageUrl} alt="Recipe preview" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setValue('imageUrl', '')}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
            <UploadButton
              endpoint="imageUploader"
              appearance={{
                button: 'bg-indigo-600 text-white hover:bg-indigo-700',
                allowedContent: 'text-gray-500',
              }}
              onClientUploadComplete={(res) => {
                if (res && res[0]) {
                  setValue('imageUrl', res[0].url);
                  toast.success('Image uploaded!');
                }
              }}
              onUploadError={(error: Error) => {
                toast.error(`Upload failed: ${error.message}`);
              }}
            />
            {errors.imageUrl && <p className="text-red-500 text-sm mt-2">{errors.imageUrl.message}</p>}
          </div>
        )}
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            {...register('title')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
            placeholder="e.g., Spicy Tomato Pasta"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
            placeholder="A brief description of your dish..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Servings</label>
            <input
              type="number"
              {...register('servings', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
            />
            {errors.servings && <p className="text-red-500 text-sm mt-1">{errors.servings.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Prep Time (min)</label>
            <input
              type="number"
              {...register('prepTime', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
            />
            {errors.prepTime && <p className="text-red-500 text-sm mt-1">{errors.prepTime.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cook Time (min)</label>
            <input
              type="number"
              {...register('cookTime', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
            />
            {errors.cookTime && <p className="text-red-500 text-sm mt-1">{errors.cookTime.message}</p>}
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Ingredients</label>
        <div className="space-y-2">
          {ingredientFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1">
                <input
                  {...register(`ingredients.${index}.name`)}
                  placeholder="Ingredient"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
                />
                {errors.ingredients?.[index]?.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.ingredients[index]?.name?.message}</p>
                )}
              </div>
              <div className="w-20">
                <input
                  type="number"
                  step="0.1"
                  {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                  placeholder="Qty"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
                />
              </div>
              <div className="w-24">
                <input
                  {...register(`ingredients.${index}.unit`)}
                  placeholder="Unit"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
                />
              </div>
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => appendIngredient({ name: '', quantity: 1, unit: '' })}
          className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-500"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Ingredient
        </button>
        {errors.ingredients && <p className="text-red-500 text-sm mt-1">{errors.ingredients.message}</p>}
      </div>

      {/* Steps */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
        <div className="space-y-2">
          {stepFields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start">
              <span className="mt-2 text-sm text-gray-500 w-6">{index + 1}.</span>
              <div className="flex-1">
                <textarea
                  {...register(`steps.${index}.value`)}
                  rows={2}
                  placeholder="Describe this step..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border text-gray-900"
                />
                {errors.steps?.[index]?.value && (
                  <p className="text-red-500 text-xs mt-1">{errors.steps[index]?.value?.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeStep(index)}
                className="p-2 text-gray-400 hover:text-red-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => appendStep({ value: '' })}
          className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-500"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Step
        </button>
        {errors.steps && <p className="text-red-500 text-sm mt-1">{errors.steps.message}</p>}
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-indigo-600 hover:text-indigo-900 focus:outline-none"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type a tag and press Enter (e.g., vegan, spicy)"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border text-gray-900"
          />
          <p className="text-xs text-gray-500">Press Enter to add a tag</p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {recipeId ? 'Updating Recipe...' : 'Creating Recipe...'}
            </>
          ) : (
            recipeId ? 'Update Recipe' : 'Create Recipe'
          )}
        </button>
      </div>
    </form>
  );
}
