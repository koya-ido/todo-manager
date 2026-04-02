import { ToggleGroup, ToggleGroupItem } from "@/components/forms/ToggleGroup";
import { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Forms/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    type: "single",
    children: [
      <ToggleGroupItem value="option1" key="option1">
        Option 1
      </ToggleGroupItem>,
      <ToggleGroupItem value="option2" key="option2">
        Option 2
      </ToggleGroupItem>,
      <ToggleGroupItem value="option3" key="option3">
        Option 3
      </ToggleGroupItem>,
    ],
  },
  argTypes: {
    type: {
      control: {
        select: ["single", "multiple"],
      },
    },
  },
};
