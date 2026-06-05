import { ProgressCircle } from "@/components/Layout/ProgressCircle";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Layout/ProgressCircle",
  component: ProgressCircle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["not-started", "in-progress", "done", "pending"],
    },
    progress: {
      control: { type: "number", min: 0, max: 100 },
    },
  },
} satisfies Meta<typeof ProgressCircle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {
  args: {
    status: "in-progress",
    progress: 75,
  },
};

export const Done: Story = {
  args: {
    status: "done",
    progress: 100,
  },
};

export const NotStarted: Story = {
  args: {
    status: "not-started",
    progress: 0,
  },
};

export const Pending: Story = {
  args: {
    status: "pending",
    progress: 50,
  },
};

export const Large: Story = {
  args: {
    status: "in-progress",
    progress: 75,
    className: "w-24 h-24",
  },
};

export const Small: Story = {
  args: {
    status: "in-progress",
    progress: 75,
    className: "w-6 h-6",
  },
};
