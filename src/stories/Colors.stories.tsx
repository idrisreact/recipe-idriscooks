import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React from 'react';

const meta = {
  title: 'Design System/Foundation/Colors',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Color system for the Murakamicity design language.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const BrandColors: Story = {
  render: () => (
    <div>
      <h2>Brand Colors</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 80, height: 80, backgroundColor: '#F20094', borderRadius: 8 }} />
          <div>
            <h4>Primary Pink</h4>
            <p>#F20094</p>
          </div>
        </div>
      </div>
    </div>
  ),
};