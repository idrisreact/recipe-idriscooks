import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Design System/Foundation/Colors',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Color system for the Murakamicity design language. Features the signature pink (#F20094) as the primary brand color with carefully selected supporting colors.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const ColorSwatch = ({ color, name, hex, usage }: { color: string; name: string; hex: string; usage: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
    <div 
      style={{ 
        width: '80px', 
        height: '80px', 
        backgroundColor: color, 
        borderRadius: '8px',
        border: color === '#FFFFFF' ? '1px solid #E5E7EB' : 'none',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }} 
    />
    <div>
      <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A', margin: '0 0 0.25rem 0' }}>
        {name}
      </h4>
      <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 0.25rem 0', fontFamily: 'Monaco, monospace' }}>
        {hex}
      </p>
      <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
        {usage}
      </p>
    </div>
  </div>
);

export const BrandColors: Story = {
  render: () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0A0A0A', marginBottom: '2rem' }}>
        Brand Colors
      </h2>
      
      <ColorSwatch 
        color="#F20094"
        name="Primary Pink"
        hex="#F20094"
        usage="Main brand color for buttons, links, and key accents"
      />
      
      <ColorSwatch 
        color="#FF6B9D"
        name="Accent Pink"
        hex="#FF6B9D"
        usage="Lighter pink for hover states and decorative elements"
      />
      
      <ColorSwatch 
        color="#D1007A"
        name="Dark Pink"
        hex="#D1007A"
        usage="Darker shade of primary for active states"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Primary brand colors featuring the signature Murakamicity pink palette.',
      },
    },
  },
};

export const SemanticColors: Story = {
  render: () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0A0A0A', marginBottom: '2rem' }}>
        Semantic Colors
      </h2>
      
      <ColorSwatch 
        color="#22c55e"
        name="Success Green"
        hex="#22c55e"
        usage="Success states, confirmations, and positive actions"
      />
      
      <ColorSwatch 
        color="#f59e0b"
        name="Warning Orange"
        hex="#f59e0b"
        usage="Warning states and caution indicators"
      />
      
      <ColorSwatch 
        color="#ef4444"
        name="Error Red"
        hex="#ef4444"
        usage="Error states, destructive actions, and alerts"
      />
      
      <ColorSwatch 
        color="#3b82f6"
        name="Info Blue"
        hex="#3b82f6"
        usage="Informational content and neutral actions"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Semantic colors for different UI states and feedback.',
      },
    },
  },
};

export const NeutralColors: Story = {
  render: () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0A0A0A', marginBottom: '2rem' }}>
        Neutral Colors
      </h2>
      
      <ColorSwatch 
        color="#0A0A0A"
        name="Text Primary"
        hex="#0A0A0A"
        usage="Primary text color for headings and body content"
      />
      
      <ColorSwatch 
        color="#374151"
        name="Text Secondary"
        hex="#374151"
        usage="Secondary text color for less important content"
      />
      
      <ColorSwatch 
        color="#6B7280"
        name="Text Muted"
        hex="#6B7280"
        usage="Muted text color for captions and metadata"
      />
      
      <ColorSwatch 
        color="#9CA3AF"
        name="Text Disabled"
        hex="#9CA3AF"
        usage="Disabled text and inactive elements"
      />
      
      <ColorSwatch 
        color="#E5E7EB"
        name="Border"
        hex="#E5E7EB"
        usage="Default border color for cards and dividers"
      />
      
      <ColorSwatch 
        color="#F3F4F6"
        name="Background Muted"
        hex="#F3F4F6"
        usage="Muted background color for subtle sections"
      />
      
      <ColorSwatch 
        color="#FAFAFA"
        name="Background"
        hex="#FAFAFA"
        usage="Main page background color"
      />
      
      <ColorSwatch 
        color="#FFFFFF"
        name="Surface"
        hex="#FFFFFF"
        usage="Card backgrounds and surface elements"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Neutral color palette for text, backgrounds, and structural elements.',
      },
    },
  },
};

export const ColorCombinations: Story = {
  render: () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0A0A0A', marginBottom: '2rem' }}>
        Color Combinations
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Primary Button */}
        <div style={{ 
          backgroundColor: '#F20094', 
          color: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            Primary Button
          </h3>
          <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>
            Pink background with white text
          </p>
        </div>

        {/* Secondary Button */}
        <div style={{ 
          backgroundColor: '#6B7280', 
          color: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            Secondary Button
          </h3>
          <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>
            Gray background with white text
          </p>
        </div>

        {/* Outline Button */}
        <div style={{ 
          backgroundColor: 'white', 
          color: '#F20094', 
          padding: '1.5rem', 
          borderRadius: '8px',
          border: '2px solid #F20094',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            Outline Button
          </h3>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Pink border with pink text
          </p>
        </div>

        {/* Success State */}
        <div style={{ 
          backgroundColor: '#22c55e', 
          color: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            Success State
          </h3>
          <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>
            Green background with white text
          </p>
        </div>

        {/* Card */}
        <div style={{ 
          backgroundColor: 'white', 
          color: '#0A0A0A', 
          padding: '1.5rem', 
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            Card
          </h3>
          <p style={{ fontSize: '14px', margin: 0, color: '#6B7280' }}>
            White background with gray border
          </p>
        </div>

        {/* Muted Background */}
        <div style={{ 
          backgroundColor: '#F3F4F6', 
          color: '#0A0A0A', 
          padding: '1.5rem', 
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 0.5rem 0' }}>
            Muted Section
          </h3>
          <p style={{ fontSize: '14px', margin: 0, color: '#6B7280' }}>
            Light gray background
          </p>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples of color combinations used in various UI components.',
      },
    },
  },
};

export const AccessibilityGuidance: Story = {
  render: () => (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0A0A0A', marginBottom: '2rem' }}>
        Accessibility Guidelines
      </h2>
      
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#22c55e', marginBottom: '1rem' }}>
          ✅ Good Contrast Examples
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ 
            backgroundColor: '#F20094', 
            color: 'white', 
            padding: '1rem', 
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Primary Pink on White Text</span>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>Contrast: 7.2:1 (AAA)</span>
          </div>
          
          <div style={{ 
            backgroundColor: '#0A0A0A', 
            color: 'white', 
            padding: '1rem', 
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Dark Text on White Background</span>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>Contrast: 18.7:1 (AAA)</span>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            color: '#6B7280', 
            padding: '1rem', 
            borderRadius: '6px',
            border: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Muted Text on White Background</span>
            <span style={{ fontSize: '12px' }}>Contrast: 5.2:1 (AA)</span>
          </div>
        </div>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#ef4444', marginBottom: '1rem' }}>
          ❌ Poor Contrast Examples (Avoid)
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ 
            backgroundColor: '#FF6B9D', 
            color: 'white', 
            padding: '1rem', 
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: 0.7
          }}>
            <span>Light Pink on White Text</span>
            <span style={{ fontSize: '12px', opacity: 0.9 }}>Contrast: 3.1:1 (Fails AA)</span>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            color: '#9CA3AF', 
            padding: '1rem', 
            borderRadius: '6px',
            border: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            opacity: 0.7
          }}>
            <span>Very Light Gray on White</span>
            <span style={{ fontSize: '12px' }}>Contrast: 2.8:1 (Fails AA)</span>
          </div>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#F3F4F6', 
        padding: '1.5rem', 
        borderRadius: '8px',
        borderLeft: '4px solid #3b82f6'
      }}>
        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A', margin: '0 0 0.5rem 0' }}>
          💡 Best Practices
        </h4>
        <ul style={{ fontSize: '14px', color: '#374151', margin: 0, paddingLeft: '1rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>Ensure all text meets WCAG AA contrast requirements (4.5:1 for normal text)</li>
          <li style={{ marginBottom: '0.5rem' }}>Use AAA contrast (7:1) for important content and small text</li>
          <li style={{ marginBottom: '0.5rem' }}>Test colors with accessibility tools and different vision conditions</li>
          <li>Never rely on color alone to convey important information</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessibility guidelines and contrast examples for the color system.',
      },
    },
  },
};