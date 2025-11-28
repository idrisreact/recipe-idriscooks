'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { ChefHat, ArrowLeft, ArrowRight, X } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

export interface RecipeStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  duration?: string;
  tips?: string[];
}

interface RecipeStepCardsProps {
  steps: RecipeStep[];
  onComplete?: () => void;
  onClose?: () => void;
}

export function RecipeStepCards({ steps, onComplete, onClose }: RecipeStepCardsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableInstances = useRef<Draggable[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous instances
    draggableInstances.current.forEach((instance) => instance.kill());
    draggableInstances.current = [];

    // Initialize cards with stacked appearance
    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const offset = index * 8;
      const rotation = (index - currentStep) * 2;
      const scale = 1 - index * 0.02;

      gsap.set(card, {
        y: offset,
        rotation: rotation,
        scale: scale,
        zIndex: steps.length - index,
        opacity: index < currentStep ? 0 : 1,
        transformOrigin: 'center center',
      });
    });

    // Make current card draggable
    const currentCard = cardsRef.current[currentStep];
    if (currentCard && currentStep < steps.length) {
      const draggable = Draggable.create(currentCard, {
        type: 'x,y',
        bounds: containerRef.current,
        inertia: true,
        onDrag: function () {
          const rotation = (this.x / 100) * 15;
          gsap.set(currentCard, { rotation });
        },
        onDragEnd: function () {
          const threshold = 150;
          const velocityThreshold = 0.5;

          if (
            Math.abs(this.x) > threshold ||
            Math.abs(this.getVelocity('x')) > velocityThreshold * 1000
          ) {
            // Card swiped - move to next step
            const direction = this.x > 0 ? 1 : -1;

            gsap.to(currentCard, {
              x: direction * window.innerWidth,
              y: this.y,
              rotation: direction * 30,
              opacity: 0,
              duration: 0.3,
              ease: 'power2.out',
              onComplete: () => {
                if (currentStep < steps.length - 1) {
                  setCurrentStep(currentStep + 1);
                } else {
                  onComplete?.();
                }
              },
            });
          } else {
            // Snap back to center
            gsap.to(currentCard, {
              x: 0,
              y: 0,
              rotation: 0,
              duration: 0.4,
              ease: 'elastic.out(1, 0.5)',
            });
          }
        },
      })[0];

      draggableInstances.current.push(draggable);
    }

    return () => {
      draggableInstances.current.forEach((instance) => instance.kill());
    };
  }, [currentStep, steps.length, onComplete]);

  const goToNext = () => {
    const currentCard = cardsRef.current[currentStep];
    if (!currentCard || currentStep >= steps.length - 1) return;

    gsap.to(currentCard, {
      x: window.innerWidth,
      rotation: 30,
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => setCurrentStep(currentStep + 1),
    });
  };

  const goToPrevious = () => {
    if (currentStep <= 0) return;

    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);

    const prevCard = cardsRef.current[prevStep];
    if (prevCard) {
      gsap.fromTo(
        prevCard,
        { x: -window.innerWidth, rotation: -30, opacity: 0 },
        { x: 0, rotation: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center gap-3">
          <ChefHat className="w-6 h-6 text-white" />
          <div>
            <h2 className="text-white font-bold text-lg">Cooking Mode</h2>
            <p className="text-white/70 text-sm">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Close cooking mode"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-4">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#F20094] transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Cards Container */}
      <div
        ref={containerRef}
        className="flex-1 relative flex items-center justify-center overflow-hidden px-4"
      >
        {steps.map((step, index) => (
          <div
            key={step.id}
            ref={(el) => {
              cardsRef.current[index] = el;
            }}
            className="absolute w-full max-w-md h-[600px] bg-white rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing"
            style={{
              touchAction: 'none',
            }}
          >
            {/* Card Content */}
            <div className="h-full flex flex-col">
              {/* Image */}
              {step.image && (
                <div className="h-48 bg-gray-200 rounded-t-2xl overflow-hidden relative">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#F20094]/10 text-[#F20094]">
                    Step {index + 1}
                  </span>
                  {step.duration && (
                    <span className="text-sm text-gray-600">⏱️ {step.duration}</span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  {step.description}
                </p>

                {step.tips && step.tips.length > 0 && (
                  <div className="mt-auto">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 Tips:</h4>
                    <ul className="space-y-1">
                      {step.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-[#F20094] mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Swipe Hint */}
                {index === currentStep && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">Swipe to continue →</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Completion Message */}
        {currentStep >= steps.length && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white max-w-md px-4">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChefHat className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-3">Great Job!</h3>
              <p className="text-white/80 text-lg mb-6">
                You&apos;ve completed all the steps. Enjoy your meal!
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Exit Cooking Mode
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep < steps.length && (
        <div className="flex items-center justify-between p-6 bg-gradient-to-t from-black/50 to-transparent">
          <button
            onClick={goToPrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={goToNext}
            disabled={currentStep >= steps.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-[#F20094] hover:bg-[#d1007d] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <span className="hidden sm:inline">Next</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
