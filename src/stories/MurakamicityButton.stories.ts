import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { MurakamicityButton } from './MurakamicityButton';

const meta = {
  title: 'Design System/Components/Murakamicity Button',
  component: MurakamicityButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'The Murakamicity button component follows the design system guidelines with signature pink color (#F20094), consistent spacing, and interactive states. Perfect for call-to-action elements in the recipe platform.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost'],
      description: 'Visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: 'Size of the button affecting padding and text size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button and show disabled styling',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Make the button take full width of its container',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading spinner and disable interactions',
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof MurakamicityButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Add to Favorites',
  },
  parameters: {
    docs: {
      description: {
        story: 'Primary button with the signature pink background. Use for main call-to-action elements.',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'View Recipe',
  },
  parameters: {
    docs: {
      description: {
        story: 'Secondary button with gray background. Use for secondary actions.',
      },
    },
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Browse Recipes',
  },
  parameters: {
    docs: {
      description: {
        story: 'Outline button with pink border. Use when you need a less prominent action.',
      },
    },
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Cancel',
  },
  parameters: {
    docs: {
      description: {
        story: 'Ghost button with minimal styling. Use for subtle actions or navigation.',
      },
    },
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    children: '❤️ Like',
  },
  parameters: {
    docs: {
      description: {
        story: 'Small button for compact interfaces or secondary actions.',
      },
    },
  },
};

export const Medium: Story = {
  args: {
    size: 'medium',
    children: 'Save Recipe',
  },
  parameters: {
    docs: {
      description: {
        story: 'Medium button - the default size for most use cases.',
      },
    },
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    children: 'Get Started',
  },
  parameters: {
    docs: {
      description: {
        story: 'Large button for prominent call-to-action elements.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled state with reduced opacity and no pointer events.',
      },
    },
  },
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Saving Recipe...',
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading state with animated spinner and disabled interactions.',
      },
    },
  },
};

export const FullWidth: Story = {
  args: {
    variant: 'primary',
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    docs: {
      description: {
        story: 'Full width button that stretches to fill its container.',
      },
    },
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    children: (
      <>
        <span>📥</span>
        Download PDF
      </>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with icon and text content using React children.',
      },
    },
  },
};

// Showcase stories
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <MurakamicityButton variant="primary">Primary</MurakamicityButton>
      <MurakamicityButton variant="secondary">Secondary</MurakamicityButton>
      <MurakamicityButton variant="outline">Outline</MurakamicityButton>
      <MurakamicityButton variant="ghost">Ghost</MurakamicityButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button variants displayed together for comparison.',
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <MurakamicityButton size="small">Small</MurakamicityButton>
      <MurakamicityButton size="medium">Medium</MurakamicityButton>
      <MurakamicityButton size="large">Large</MurakamicityButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button sizes displayed together for comparison.',
      },
    },
  },
};

export const RecipeActions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
      <MurakamicityButton variant="primary" size="large">
        ❤️ Add to Favorites
      </MurakamicityButton>
      <MurakamicityButton variant="outline" size="large">
        📥 Download PDF
      </MurakamicityButton>
      <MurakamicityButton variant="ghost" size="medium">
        Share Recipe
      </MurakamicityButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of recipe-related action buttons using the Murakamicity design system.',
      },
    },
  },
};

export const ResponsiveExample: Story = {
  render: () => (
    <div style={{ width: '100%', maxWidth: '400px' }}>
      <div style={{ marginBottom: '1rem' }}>
        <MurakamicityButton variant="primary" fullWidth>
          Sign Up for Free
        </MurakamicityButton>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <MurakamicityButton variant="outline" fullWidth>
          Log In
        </MurakamicityButton>
        <MurakamicityButton variant="ghost" fullWidth>
          Learn More
        </MurakamicityButton>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of responsive button layout suitable for mobile interfaces.',
      },
    },
  },
};