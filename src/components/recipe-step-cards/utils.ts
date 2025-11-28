import { RecipeStep } from './recipe-step-cards';

/**
 * Converts recipe instructions into step format for the cooking mode
 */
export function convertInstructionsToSteps(
  instructions: string[],
  recipeImage?: string
): RecipeStep[] {
  return instructions.map((instruction, index) => ({
    id: `step-${index + 1}`,
    title: `Step ${index + 1}`,
    description: instruction,
    image: index === 0 ? recipeImage : undefined, // Show recipe image on first step
  }));
}

/**
 * Parses instructions with duration markers (e.g., "Mix for 5 minutes")
 * and extracts the duration
 */
export function parseInstructionWithDuration(instruction: string): {
  description: string;
  duration?: string;
} {
  // Match patterns like "5 minutes", "10 mins", "1 hour", etc.
  const durationPattern = /(\d+)\s*(minute|minutes|min|mins|hour|hours|hr|hrs)/gi;
  const match = instruction.match(durationPattern);

  if (match) {
    return {
      description: instruction,
      duration: match[0],
    };
  }

  return { description: instruction };
}

/**
 * Converts detailed recipe instructions with metadata into steps
 */
export function convertDetailedInstructionsToSteps(
  instructions: Array<{
    text: string;
    duration?: string;
    tips?: string[];
    image?: string;
  }>,
  defaultImage?: string
): RecipeStep[] {
  return instructions.map((instruction, index) => {
    const parsedDuration = instruction.duration || parseInstructionWithDuration(instruction.text).duration;

    return {
      id: `step-${index + 1}`,
      title: `Step ${index + 1}`,
      description: instruction.text,
      duration: parsedDuration,
      tips: instruction.tips,
      image: instruction.image || (index === 0 ? defaultImage : undefined),
    };
  });
}
