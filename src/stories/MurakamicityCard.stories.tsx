import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';
import { MurakamicityCard } from './MurakamicityCard';

const meta = {
  title: 'Design System/Components/Murakamicity Card',
  component: MurakamicityCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The Murakamicity card component provides consistent containers for content with various styling options. Features hover animations, background images for recipe cards, and consistent spacing following the design system.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'recipe', 'elevated', 'bordered'],
      description: 'Visual style variant of the card',
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'small', 'medium', 'large'],
      description: 'Internal padding of the card',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable hover effects and click interactions',
    },
    backgroundImage: {
      control: 'text',
      description: 'Background image URL for recipe cards',
    },
    title: {
      control: 'text',
      description: 'Card title text',
    },
    subtitle: {
      control: 'text',
      description: 'Card subtitle text',
    },
  },
  args: { onClick: () => {} },
} satisfies Meta<typeof MurakamicityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Card Title</h3>
        <p className="text-gray-600">
          This is a default card with some content inside. It has subtle borders and shadows.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default card with subtle styling - perfect for general content containers.',
      },
    },
  },
};

export const Recipe: Story = {
  args: {
    variant: 'recipe',
    title: 'Chocolate Chip Cookies',
    subtitle: 'Classic homemade cookies that are crispy outside, chewy inside',
    backgroundImage:
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop',
    interactive: true,
    children: (
      <div className="mt-4">
        <div className="flex items-center gap-4 text-white/90 text-sm">
          <span>⏱️ 25 min</span>
          <span>👥 4 servings</span>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Recipe card with background image, overlay gradient, and recipe metadata.',
      },
    },
  },
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <div>
        <div className="w-12 h-12 bg-[#F20094] rounded-lg mb-4 flex items-center justify-center">
          <span className="text-white text-xl">🎯</span>
        </div>
        <h3 className="font-semibold text-lg mb-2">Featured Recipe</h3>
        <p className="text-gray-600">This recipe has been featured by our chef community.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Elevated card with stronger shadow for important content.',
      },
    },
  },
};

export const Bordered: Story = {
  args: {
    variant: 'bordered',
    children: (
      <div>
        <h3 className="font-semibold text-lg mb-2 text-[#F20094]">Premium Feature</h3>
        <p className="text-gray-600">
          This card uses the bordered variant with the signature pink border.
        </p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Bordered card with signature pink border for special content.',
      },
    },
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    children: (
      <div>
        <h3 className="font-semibold text-lg mb-2">Click me!</h3>
        <p className="text-gray-600">This card has hover effects and can be clicked.</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive card with hover animations and click handling.',
      },
    },
  },
};
{
}

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <div className="p-0">
        <img
          src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=200&fit=crop"
          alt="Pancakes"
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">Fluffy Pancakes</h3>
          <p className="text-gray-600">Perfect for weekend breakfast</p>
        </div>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with no padding - useful when you need full control over spacing.',
      },
    },
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'small',
    children: (
      <div>
        <span className="inline-block px-2 py-1 bg-[#F20094] text-white text-xs rounded-full mb-2">
          Quick Recipe
        </span>
        <h4 className="font-semibold">5-Minute Smoothie</h4>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with small padding for compact content.',
      },
    },
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'large',
    children: (
      <div className="text-center">
        <div className="w-16 h-16 bg-[#F20094] rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-white text-2xl">👨‍🍳</span>
        </div>
        <h3 className="font-semibold text-xl mb-2">Join Our Community</h3>
        <p className="text-gray-600 mb-4">
          Connect with fellow food enthusiasts and share your favorite recipes.
        </p>
        <button className="px-6 py-2 bg-[#F20094] text-white rounded-lg hover:bg-[#D1007A] transition-colors">
          Get Started
        </button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Card with large padding for spacious layouts and call-to-action content.',
      },
    },
  },
};

export const AllVariants: Story = {
  args: {
    children: 'Card Content',
    onClick: () => {},
  },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        maxWidth: '800px',
      }}
    >
      <MurakamicityCard variant="default">
        <h4 className="font-semibold mb-2">Default</h4>
        <p className="text-sm text-gray-600">Standard card styling</p>
      </MurakamicityCard>

      <MurakamicityCard variant="elevated">
        <h4 className="font-semibold mb-2">Elevated</h4>
        <p className="text-sm text-gray-600">Enhanced shadow</p>
      </MurakamicityCard>

      <MurakamicityCard variant="bordered">
        <h4 className="font-semibold mb-2 text-[#F20094]">Bordered</h4>
        <p className="text-sm text-gray-600">Pink border accent</p>
      </MurakamicityCard>

      <MurakamicityCard
        variant="recipe"
        title="Recipe Card"
        subtitle="With background image"
        backgroundImage="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=200&fit=crop"
      >
        <div className="text-white/90 text-sm">⏱️ 30 min</div>
      </MurakamicityCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All card variants displayed together for comparison.',
      },
    },
  },
};

export const RecipeGrid: Story = {
  args: {
    children: 'Card Content',
    onClick: () => {},
  },
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
        maxWidth: '900px',
      }}
    >
      {[
        {
          title: 'Classic Margherita Pizza',
          subtitle: 'Traditional Italian pizza with fresh mozzarella',
          image:
            'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
          time: '45 min',
          servings: '4',
        },
        {
          title: 'Chocolate Brownies',
          subtitle: 'Rich and fudgy chocolate brownies',
          image:
            'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop',
          time: '35 min',
          servings: '16',
        },
        {
          title: 'Caesar Salad',
          subtitle: 'Crisp romaine with classic Caesar dressing',
          image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400&h=300&fit=crop',
          time: '15 min',
          servings: '4',
        },
      ].map((recipe, index) => (
        <MurakamicityCard
          key={index}
          variant="recipe"
          title={recipe.title}
          subtitle={recipe.subtitle}
          backgroundImage={recipe.image}
          interactive
          onClick={() => alert(`Clicked ${recipe.title}`)}
        >
          <div className="flex items-center gap-4 text-white/90 text-sm mt-3">
            <span>⏱️ {recipe.time}</span>
            <span>👥 {recipe.servings} servings</span>
          </div>
        </MurakamicityCard>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of a recipe grid using interactive recipe cards.',
      },
    },
  },
};
