'use client';

import { CookingModeButton } from '@/src/components/recipe-step-cards/cooking-mode-button';
import { RecipeStep } from '@/src/components/recipe-step-cards';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

const exampleSteps: RecipeStep[] = [
  {
    id: '1',
    title: 'Gather Ingredients',
    description: 'Collect all your ingredients and place them on your workspace. Make sure everything is measured and ready to go.',
    duration: '5 minutes',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop',
    tips: [
      'Read through the entire recipe first',
      'Measure all ingredients before starting',
      'Keep your workspace organized',
    ],
  },
  {
    id: '2',
    title: 'Prep Vegetables',
    description: 'Wash and chop all vegetables into uniform pieces. Smaller pieces cook faster and more evenly.',
    duration: '10 minutes',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    tips: [
      'Use a sharp knife for clean cuts',
      'Keep vegetables similar in size',
      'Save vegetable scraps for stock',
    ],
  },
  {
    id: '3',
    title: 'Heat the Pan',
    description: 'Place your pan on medium-high heat and add oil. Let it heat until it shimmers but does not smoke.',
    duration: '3 minutes',
    tips: [
      'Use a heavy-bottomed pan for even heating',
      'Test oil temperature with a small piece of vegetable',
    ],
  },
  {
    id: '4',
    title: 'Sauté Aromatics',
    description: 'Add garlic, onions, and ginger to the hot oil. Stir frequently until fragrant and golden brown.',
    duration: '4 minutes',
    tips: [
      'Don\'t let garlic burn - it becomes bitter',
      'Adjust heat if cooking too fast',
      'Stir constantly for even cooking',
    ],
  },
  {
    id: '5',
    title: 'Add Main Ingredients',
    description: 'Add your protein and vegetables to the pan. Toss to coat with the aromatics and cook until vegetables are tender-crisp.',
    duration: '8 minutes',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop',
    tips: [
      'Don\'t overcrowd the pan',
      'Cook in batches if needed',
      'Keep stirring for even cooking',
    ],
  },
  {
    id: '6',
    title: 'Season and Finish',
    description: 'Add your sauce and seasonings. Toss everything together and cook for a final 2-3 minutes until the sauce thickens.',
    duration: '3 minutes',
    tips: [
      'Taste and adjust seasoning',
      'Add fresh herbs at the end',
    ],
  },
  {
    id: '7',
    title: 'Plate and Serve',
    description: 'Transfer to a serving dish and garnish with fresh herbs. Serve immediately while hot.',
    duration: '2 minutes',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
    tips: [
      'Warm your plates for best results',
      'Garnish makes it look professional',
      'Serve immediately for best taste',
    ],
  },
];

export default function CookingModeDemoPage() {
  return (
    <div className="wrapper page min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Cooking Mode Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the interactive step-by-step cooking mode with card stack animations.
            Swipe through recipe steps like a pro chef!
          </p>
        </div>

        {/* Demo Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Simple Stir-Fry Recipe
              </h2>
              <p className="text-gray-600 mb-6">
                A delicious and healthy stir-fry recipe perfect for weeknight dinners.
                This demo includes 7 detailed steps with images, tips, and timing.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Total Time</p>
                  <p className="text-2xl font-bold text-gray-900">35 min</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Steps</p>
                  <p className="text-2xl font-bold text-gray-900">7 steps</p>
                </div>
              </div>

              <CookingModeButton steps={exampleSteps} />
            </div>

            <div className="flex-shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=400&fit=crop"
                alt="Stir-fry dish"
                width={256}
                height={256}
                className="w-64 h-64 rounded-xl object-cover shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👆</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Swipe to Navigate</h3>
              <p className="text-gray-600">
                Drag cards left or right to move between steps. Smooth GSAP animations make it feel natural.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Track Progress</h3>
              <p className="text-gray-600">
                See your progress with a visual progress bar and step counter at the top.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Helpful Tips</h3>
              <p className="text-gray-600">
                Get cooking tips and timing information for each step to ensure perfect results.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Mobile Optimized</h3>
              <p className="text-gray-600">
                Works perfectly on phones and tablets with touch gestures and responsive design.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⌨️</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Keyboard Controls</h3>
              <p className="text-gray-600">
                Use Previous/Next buttons for easy navigation without swiping.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="font-bold text-lg mb-2">Beautiful Design</h3>
              <p className="text-gray-600">
                Card stack with depth, rotation, and smooth transitions for a premium feel.
              </p>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Use</h2>
          <ol className="space-y-4 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#F20094] text-white rounded-full flex items-center justify-center font-bold">
                1
              </span>
              <span>
                <strong>Click &quot;Start Cooking Mode&quot;</strong> to enter full-screen cooking mode
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#F20094] text-white rounded-full flex items-center justify-center font-bold">
                2
              </span>
              <span>
                <strong>Swipe cards</strong> left or right, or use the Previous/Next buttons to navigate
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#F20094] text-white rounded-full flex items-center justify-center font-bold">
                3
              </span>
              <span>
                <strong>Read each step</strong> carefully and follow the tips for best results
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 bg-[#F20094] text-white rounded-full flex items-center justify-center font-bold">
                4
              </span>
              <span>
                <strong>Complete all steps</strong> to see the success message and exit cooking mode
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
