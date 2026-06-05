import { Badge } from "@/components/Layout/Badge";
import { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Layout/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
    },
    children: {
      control: "text",
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "default",
    children: "Default Badge",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Badge",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive Badge",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline Badge",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost Badge",
  },
};

export const LinkVariant: Story = {
  args: {
    variant: "link",
    children: "Link Badge",
  },
};
