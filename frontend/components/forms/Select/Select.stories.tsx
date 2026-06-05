import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/forms/Select";
import { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Forms/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger>
        <SelectValue placeholder="Select a framework" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="next">Next.js</SelectItem>
        <SelectItem value="remix">Remix</SelectItem>
        <SelectItem value="astro">Astro</SelectItem>
        <SelectItem value="vite">Vite</SelectItem>
      </SelectContent>
    </Select>
  ),
};
