import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design System/Foundation/Typography',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Typography system for the Murakamicity design language. Based on Inter font family with consistent scale and hierarchy.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const TypeScale: Story = {
  render: () => (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '48px', lineHeight: '52px', fontWeight: 700, color: '#F20094', marginBottom: '0.5rem' }}>
          Display
        </h1>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>48px / 52px • Font weight 700 • Used for hero headlines</p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '32px', lineHeight: '36px', fontWeight: 600, color: '#0A0A0A', marginBottom: '0.5rem' }}>
          Heading
        </h2>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>32px / 36px • Font weight 600 • Used for page and section headings</p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '24px', lineHeight: '28px', fontWeight: 600, color: '#0A0A0A', marginBottom: '0.5rem' }}>
          Subheading
        </h3>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>24px / 28px • Font weight 600 • Used for subsection headings</p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <p style={{ fontSize: '18px', lineHeight: '24px', fontWeight: 400, color: '#0A0A0A', marginBottom: '0.5rem' }}>
          Large Text
        </p>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>18px / 24px • Font weight 400 • Used for prominent body text and introductions</p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <p style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 400, color: '#0A0A0A', marginBottom: '0.5rem' }}>
          Body Text
        </p>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>16px / 24px • Font weight 400 • Default body text size</p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <p style={{ fontSize: '14px', lineHeight: '20px', fontWeight: 400, color: '#6B7280', marginBottom: '0.5rem' }}>
          Small Text
        </p>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>14px / 20px • Font weight 400 • Used for captions and metadata</p>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <p style={{ fontSize: '12px', lineHeight: '16px', fontWeight: 400, color: '#6B7280', marginBottom: '0.5rem' }}>
          Extra Small
        </p>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>12px / 16px • Font weight 400 • Used for fine print and labels</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete typography scale showing all text sizes used in the Murakamicity design system.',
      },
    },
  },
};

export const FontWeights: Story = {
  render: () => (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '24px', marginBottom: '1rem', color: '#0A0A0A' }}>Font Weights</h3>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '18px', fontWeight: 400, color: '#0A0A0A', marginBottom: '0.25rem' }}>
          Regular (400)
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Used for body text and general content</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '18px', fontWeight: 500, color: '#0A0A0A', marginBottom: '0.25rem' }}>
          Medium (500)
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Used for emphasized text and button labels</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '18px', fontWeight: 600, color: '#0A0A0A', marginBottom: '0.25rem' }}>
          Semibold (600)
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Used for headings and important UI text</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '18px', fontWeight: 700, color: '#0A0A0A', marginBottom: '0.25rem' }}>
          Bold (700)
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Used for display text and strong emphasis</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Available font weights in the design system with their intended usage.',
      },
    },
  },
};

export const TextColors: Story = {
  render: () => (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '24px', marginBottom: '1rem', color: '#0A0A0A' }}>Text Colors</h3>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '18px', color: '#0A0A0A', marginBottom: '0.25rem' }}>
          Primary Text (#0A0A0A)
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Main text color for headings and body content</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '0.25rem' }}>
          Muted Text (#6B7280)
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Secondary text color for captions and metadata</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '18px', color: '#F20094', marginBottom: '0.25rem' }}>
          Primary Pink (#F20094)
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Brand color for links, accents, and emphasis</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '18px', color: '#22c55e', marginBottom: '0.25rem' }}>
          Success Green (#22c55e)
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Used for success states and confirmations</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '18px', color: '#ef4444', marginBottom: '0.25rem' }}>
          Error Red (#ef4444)
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Used for error states and warnings</p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '18px', color: '#FFFFFF', backgroundColor: '#0A0A0A', padding: '0.5rem', borderRadius: '4px', marginBottom: '0.25rem' }}>
          White Text (#FFFFFF)
        </p>
        <p style={{ fontSize: '14px', color: '#6B7280' }}>Used on dark backgrounds and colored buttons</p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Text color palette with usage guidelines for different content types.',
      },
    },
  },
};

export const RecipeContent: Story = {
  render: () => (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', maxWidth: '600px' }}>
      <h1 style={{ fontSize: '32px', lineHeight: '36px', fontWeight: 600, color: '#0A0A0A', marginBottom: '0.5rem' }}>
        Chocolate Chip Cookies
      </h1>
      <p style={{ fontSize: '18px', lineHeight: '24px', color: '#6B7280', marginBottom: '2rem' }}>
        Classic homemade cookies that are crispy outside, chewy inside
      </p>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            PREP TIME
          </p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A' }}>15 min</p>
        </div>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            COOK TIME
          </p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A' }}>12 min</p>
        </div>
        <div>
          <p style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
            SERVINGS
          </p>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A' }}>24 cookies</p>
        </div>
      </div>

      <h2 style={{ fontSize: '24px', lineHeight: '28px', fontWeight: 600, color: '#F20094', marginBottom: '1rem' }}>
        Ingredients
      </h2>
      <ul style={{ fontSize: '16px', lineHeight: '24px', color: '#0A0A0A', marginBottom: '2rem', paddingLeft: '1rem' }}>
        <li style={{ marginBottom: '0.5rem' }}>2¼ cups all-purpose flour</li>
        <li style={{ marginBottom: '0.5rem' }}>1 cup butter, softened</li>
        <li style={{ marginBottom: '0.5rem' }}>¾ cup brown sugar</li>
        <li style={{ marginBottom: '0.5rem' }}>2 cups chocolate chips</li>
      </ul>

      <h2 style={{ fontSize: '24px', lineHeight: '28px', fontWeight: 600, color: '#F20094', marginBottom: '1rem' }}>
        Instructions
      </h2>
      <ol style={{ fontSize: '16px', lineHeight: '24px', color: '#0A0A0A', paddingLeft: '1rem' }}>
        <li style={{ marginBottom: '1rem' }}>
          <strong style={{ fontWeight: 600 }}>Preheat oven</strong> to 375°F (190°C).
        </li>
        <li style={{ marginBottom: '1rem' }}>
          <strong style={{ fontWeight: 600 }}>Cream butter and sugars</strong> in a large bowl until light and fluffy.
        </li>
        <li style={{ marginBottom: '1rem' }}>
          <strong style={{ fontWeight: 600 }}>Add eggs and vanilla</strong>, mixing until well combined.
        </li>
        <li>
          <strong style={{ fontWeight: 600 }}>Gradually mix in flour</strong> until just combined. Fold in chocolate chips.
        </li>
      </ol>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of typography hierarchy in a recipe context, showing how different text styles work together.',
      },
    },
  },
};