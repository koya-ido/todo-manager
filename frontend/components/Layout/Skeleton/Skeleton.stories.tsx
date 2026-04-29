import { Skeleton } from "@/components/Layout/Skeleton";
import { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Layout/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    () => (
      <div className="w-full">
        <Skeleton className="size-10 rounded-full" />
      </div>
    ),
  ],
};
