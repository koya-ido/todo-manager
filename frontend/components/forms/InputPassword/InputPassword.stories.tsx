import { InputPassword } from "@/components/forms/InputPassword";
import { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Forms/InputPassword",
  component: InputPassword,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InputPassword>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Password",
    required: true,
    disabled: false,
  },
};
