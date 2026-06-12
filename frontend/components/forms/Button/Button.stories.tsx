import { Button } from "@/components/forms/Button";
import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, vi } from "vitest";
import { userEvent } from "@vitest/browser/context";

const meta = {
  title: "Forms/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

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

export const Clickable: Story = {
  args: {
    children: "Clickable Button",
    onClick: vi.fn(),
  },
  play: async ({ canvasElement, args }) => {
    const button = canvasElement.querySelector("button") as HTMLButtonElement | null;
    if (!button) {
      throw new Error("ボタン要素（button）が見つかりませんでした。");
    }
    await userEvent.click(button);
    expect(args.onClick).toHaveBeenCalled();
  },
};

