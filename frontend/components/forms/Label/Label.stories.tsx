import { Input } from "@/components/forms/Input";
import { Label } from "@/components/forms/Label";
import { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Forms/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    () => (
      <Label>
        Label
        <Input />
      </Label>
    ),
  ],
};
