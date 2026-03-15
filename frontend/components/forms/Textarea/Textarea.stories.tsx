import { Textarea } from "@/components/forms/Textarea";
import { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Forms/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="w-40 h-10">
        <Story />
      </div>
    ),
  ],
};
