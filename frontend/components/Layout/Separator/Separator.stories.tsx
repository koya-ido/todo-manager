import { Separator } from "@/components/Layout/Separator";
import { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Layout/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    orientation: "horizontal",
  },
  decorators: [
    (Story, { args }) => (
      <div className="flex flex-col gap-3">
        <h1>Hello world</h1>
        <Story {...args} />
        <h2>Content 1</h2>
        <p>Paragragh 1</p>
        <p>Paragragh 2</p>
        <p>Paragragh 3</p>
        <Story {...args} />
        <h2>Content 2</h2>
        <p>Paragragh 1</p>
        <p>Paragragh 2</p>
        <p>Paragragh 3</p>
      </div>
    ),
  ],
};
