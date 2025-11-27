'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
  ChefHat,
  Maximize2,
  Minimize2,
  CheckCircle2,
  List,
} from 'lucide-react';
import Link from 'next/link';

interface Recipe {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  ingredients: Array<{ name: string; quantity: number; unit: string }> | string[];
  steps: string[];
  tags: string[];
}

export default function CookModePage() {
  const params = useParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showIngredients, setShowIngredients] = useState(false);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch recipe data
  const {
    data: recipe,
    isLoading,
    error,
  } = useQuery<Recipe>({
    queryKey: ['recipe', params.id],
    queryFn: async () => {
      const res = await fetch(`/api/recipes/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch recipe');
      return res.json();
    },
  });

  // Wake Lock implementation
  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          const lock = await navigator.wakeLock.request('screen');
          setWakeLock(lock);
          console.log('Wake Lock active');
        }
      } catch (err) {
        console.error('Wake Lock failed:', err);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
        setWakeLock(null);
      }
    };
  }, [wakeLock]);

  // Re-request wake lock if visibility changes (e.g. tab switch)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !wakeLock) {
        try {
          if ('wakeLock' in navigator) {
            const lock = await navigator.wakeLock.request('screen');
            setWakeLock(lock);
          }
        } catch (err) {
          console.error('Re-requesting Wake Lock failed:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wakeLock]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <ChefHat className="w-12 h-12 text-[var(--primary)]" />
          <p className="text-xl font-medium tracking-widest uppercase">Loading Chef Mode...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center max-w-md px-6">
          <h2 className="text-2xl font-bold mb-4">Recipe Not Found</h2>
          <p className="text-white/60 mb-8">
            We couldn&apos;t load the recipe you&apos;re looking for.
          </p>
          <Link href="/recipes">
            <button className="px-8 py-3 bg-white text-black font-bold uppercase tracking-wide hover:bg-[var(--primary)] hover:text-white transition-colors">
              Back to Recipes
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Normalize ingredients (handle both object array and string array)
  const ingredientsList = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];

  const totalSteps = recipe.steps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Top Bar */}
      <header className="h-20 px-6 flex items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Exit Cook Mode"
          >
            <X className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-bold text-lg truncate max-w-[200px] sm:max-w-md">{recipe.title}</h1>
            <div className="flex items-center gap-2 text-xs text-white/50 uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              <span>{recipe.cookTime} min</span>
              <span>•</span>
              <span>
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className={`p-3 rounded-full transition-colors ${showIngredients ? 'bg-[var(--primary)] text-white' : 'hover:bg-white/10'}`}
            title="Toggle Ingredients"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-full hover:bg-white/10 transition-colors hidden sm:block"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1 bg-white/10 w-full">
        <motion.div
          className="h-full bg-[var(--primary)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 relative flex overflow-hidden">
        {/* Step Content */}
        <div className="flex-1 flex flex-col relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto"
            >
              <div className="max-w-4xl w-full">
                <span className="inline-block text-[var(--primary)] font-black text-6xl sm:text-8xl opacity-20 mb-6 select-none">
                  {String(currentStep + 1).padStart(2, '0')}
                </span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-medium leading-tight mb-8">
                  {recipe.steps[currentStep]}
                </h2>

                {currentStep === totalSteps - 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="inline-flex items-center gap-2 text-[var(--primary)] font-bold uppercase tracking-widest"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    Final Step
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="h-24 border-t border-white/10 flex items-center justify-between px-6 sm:px-12 bg-black/50 backdrop-blur-md">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-3 text-lg font-bold uppercase tracking-wide disabled:opacity-30 hover:text-[var(--primary)] transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
              Previous
            </button>

            <div className="flex gap-2">{/* Dots indicator for small screens could go here */}</div>

            <button
              onClick={() => {
                if (currentStep < totalSteps - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  // Handle finish - maybe show a completion modal or confetti
                  router.push('/recipes');
                }
              }}
              className={`flex items-center gap-3 text-lg font-bold uppercase tracking-wide px-8 py-3 rounded-full transition-all ${
                currentStep === totalSteps - 1
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                  : 'bg-white text-black hover:bg-gray-200'
              }`}
            >
              {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
              {currentStep < totalSteps - 1 && <ChevronRight className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Ingredients Sidebar (Overlay on mobile, Sidebar on desktop) */}
        <AnimatePresence>
          {showIngredients && (
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-y-0 right-0 w-full sm:w-96 bg-[#111] border-l border-white/10 z-30 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-xl uppercase tracking-wider">Ingredients</h3>
                <button
                  onClick={() => setShowIngredients(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <ul className="space-y-4">
                  {ingredientsList.map((ingredient, idx) => {
                    const isString = typeof ingredient === 'string';
                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <div className="w-2 h-2 mt-2 rounded-full bg-[var(--primary)] group-hover:scale-125 transition-transform" />
                        <span className="text-lg text-white/90 leading-relaxed">
                          {isString
                            ? ingredient
                            : `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
