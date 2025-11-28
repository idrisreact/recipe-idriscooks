# Recipe Step Cards - Cooking Mode

A GSAP-powered card stack component for step-by-step recipe cooking mode, inspired by Framer's FlipCard component.

## Features

- 🎴 **Card Stack Animation** - Smooth stacking effect with rotation and depth
- 👆 **Drag to Navigate** - Swipe cards left/right to move between steps
- 📱 **Touch Optimized** - Works great on mobile and desktop
- 🎨 **Customizable Steps** - Support for images, durations, and cooking tips
- 📊 **Progress Tracking** - Visual progress bar and step counter
- ⌨️ **Keyboard Navigation** - Previous/Next buttons for easy navigation
- ✨ **Smooth Animations** - Powered by GSAP for buttery smooth transitions

## Installation

The component is already set up in your project. Just import and use it!

## Basic Usage

```tsx
import { CookingModeButton } from '@/src/components/recipe-step-cards/cooking-mode-button';
import { RecipeStep } from '@/src/components/recipe-step-cards';

const steps: RecipeStep[] = [
  {
    id: '1',
    title: 'Prep Ingredients',
    description: 'Gather all ingredients and chop vegetables into small pieces.',
    duration: '10 minutes',
    image: '/images/recipe-prep.jpg',
    tips: ['Use a sharp knife for clean cuts', 'Keep vegetables uniform in size'],
  },
  {
    id: '2',
    title: 'Heat Pan',
    description: 'Heat oil in a large pan over medium-high heat.',
    duration: '2 minutes',
  },
  // ... more steps
];

export default function RecipePage() {
  return (
    <div>
      <h1>Delicious Recipe</h1>
      <CookingModeButton steps={steps} />
    </div>
  );
}
```

## Advanced Usage

### Direct Component Usage

```tsx
import { useState } from 'react';
import { RecipeStepCards } from '@/src/components/recipe-step-cards';

export default function RecipePage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Start Cooking
      </button>

      {isOpen && (
        <RecipeStepCards
          steps={steps}
          onClose={() => setIsOpen(false)}
          onComplete={() => {
            console.log('Recipe completed!');
            // Show success message, confetti, etc.
          }}
        />
      )}
    </>
  );
}
```

### Converting Recipe Instructions

```tsx
import { convertInstructionsToSteps } from '@/src/components/recipe-step-cards/utils';

const instructions = [
  'Preheat oven to 350°F',
  'Mix flour and sugar in a bowl',
  'Add eggs and milk, stir until smooth',
  'Pour into greased pan',
  'Bake for 30 minutes',
];

const steps = convertInstructionsToSteps(instructions, '/images/recipe.jpg');
```

### Detailed Instructions with Metadata

```tsx
import { convertDetailedInstructionsToSteps } from '@/src/components/recipe-step-cards/utils';

const detailedInstructions = [
  {
    text: 'Preheat oven to 350°F and grease a 9x13 pan',
    duration: '5 minutes',
    tips: ['Use butter for best flavor', 'Make sure oven is fully preheated'],
  },
  {
    text: 'Mix all dry ingredients in a large bowl',
    duration: '3 minutes',
    tips: ['Sift flour for lighter texture'],
  },
];

const steps = convertDetailedInstructionsToSteps(detailedInstructions, '/images/recipe.jpg');
```

## API Reference

### RecipeStep

```typescript
interface RecipeStep {
  id: string;          // Unique identifier
  title: string;       // Step title
  description: string; // Detailed instructions
  image?: string;      // Optional step image
  duration?: string;   // Optional duration (e.g., "10 minutes")
  tips?: string[];     // Optional cooking tips
}
```

### RecipeStepCards Props

```typescript
interface RecipeStepCardsProps {
  steps: RecipeStep[];           // Array of recipe steps
  onComplete?: () => void;       // Called when all steps are completed
  onClose?: () => void;          // Called when user closes the modal
}
```

### CookingModeButton Props

```typescript
interface CookingModeButtonProps {
  steps: RecipeStep[];   // Array of recipe steps
  className?: string;    // Optional additional CSS classes
}
```

## Interactions

- **Swipe/Drag** - Drag cards left or right to navigate
- **Swipe Threshold** - Cards must be swiped past 150px or with velocity to trigger
- **Elastic Snap** - Cards snap back with elastic animation if not swiped enough
- **Previous/Next Buttons** - Navigate with buttons at the bottom
- **Progress Bar** - Visual indicator at the top
- **Close Button** - Exit cooking mode at any time

## Customization

### Styling

The component uses Tailwind CSS classes. You can customize colors by modifying:

- Primary color: `bg-[#F20094]` (pink)
- Background: `bg-black/95` (dark background)
- Cards: `bg-white` (white cards)

### Animation Timing

Modify animation durations in the component:

```typescript
// Card swipe animation
duration: 0.3,

// Snap back animation
duration: 0.4,
ease: 'elastic.out(1, 0.5)',
```

### Swipe Sensitivity

Adjust the swipe threshold:

```typescript
const threshold = 150; // pixels to swipe
const velocityThreshold = 0.5; // velocity multiplier
```

## Integration with Recipe Data

Add the cooking mode button to your recipe detail page:

```tsx
// In your recipe component
import { CookingModeButton } from '@/src/components/recipe-step-cards/cooking-mode-button';
import { convertInstructionsToSteps } from '@/src/components/recipe-step-cards/utils';

export function RecipeDetailView({ recipe }) {
  const steps = convertInstructionsToSteps(
    recipe.instructions,
    recipe.image
  );

  return (
    <div>
      {/* Recipe details */}

      {/* Add cooking mode button */}
      <CookingModeButton steps={steps} className="mt-6" />
    </div>
  );
}
```

## Browser Compatibility

- Modern browsers with ES6+ support
- Touch events for mobile devices
- Mouse drag for desktop
- Works with React 18+

## Dependencies

- `gsap` - Animation library
- `gsap/Draggable` - Drag plugin
- `lucide-react` - Icons
