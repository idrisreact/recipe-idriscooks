import "../../../app/globals.css";
import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CtaButton } from "./cta-button";

const meta = {
  title: "UI/button",
  component: CtaButton,
} satisfies Meta<typeof CtaButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Login",
    isPrimary: true,
  },
};
