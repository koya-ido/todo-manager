import { Toggle } from "@/components/forms/Toggle";
import { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Forms/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Label",
    variant: "default",
    size: "default",
    disabled: false,
  },
  argTypes: {
    variant: {
      control: {
        select: [
          "default",
          "destructive",
          "outline",
          "secondary",
          "ghost",
          "link",
        ],
      },
    },
    size: {
      control: {
        select: [
          "default",
          "xs",
          "sm",
          "lg",
          "icon",
          "icon-xs",
          "icon-sm",
          "icon-lg",
        ],
      },
    },
  },
};
