import { Input } from "@/components/forms/Input";
import { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Forms/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Placeholder",
    type: "text",
    required: false,
    disabled: false,
  },
  argTypes: {
    placeholder: {
      control: {
        type: "text",
      },
    },
    type: {
      control: {
        type: "select",
        options: ["text", "number"],
      },
    },
    required: {
      control: {
        type: "boolean",
      },
    },
    disabled: {
      control: {
        type: "boolean",
      },
    },
  },
};

export const Error: Story = {
  args: {},
  decorators: [() => <Input placeholder="Placeholder" aria-invalid />],
};

export const Disabled: Story = {
  args: {
    placeholder: "Placeholder",
    disabled: true,
  },
};
