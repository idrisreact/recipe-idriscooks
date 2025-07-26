import "../../../app/globals.css";
import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "../../../components/ui/button";

const meta = {
  title: "UI/Button",
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
};

export const CTA: Story = {
  args: {
    children: "Login",
    variant: "cta",
  },
};

export const Icon: Story = {
  args: {
    children: "Icon Button",
    variant: "icon",
  },
};

export const Secondary: Story = {
  args: {
    children: "Secondary",
    variant: "secondary",
  },
};
