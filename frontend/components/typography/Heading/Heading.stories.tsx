import { Heading } from "@/components/typography/Heading";
import { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Typography/Heading",
  component: Heading,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Heading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Heading",
    level: 1,
  },
  argTypes: {
    level: {
      control: {
        select: [1, 2, 3],
      },
    },
  },
};
