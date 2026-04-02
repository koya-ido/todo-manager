import { Toaster } from "@/components/Layout/Toaster";
import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { toast } from "sonner";

const meta = {
  title: "Layout/Toaster",
  component: Toaster,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  argTypes: {},
  decorators: [
    () => (
      <>
        <button onClick={() => toast("This is a toast message!")}>
          Display Toaster
        </button>
      </>
    ),
  ],
};
