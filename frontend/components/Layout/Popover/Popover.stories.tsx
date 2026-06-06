import { Button } from "@/components/forms/Button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Layout/Popover"
import { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"

const meta = {
  title: "Layout/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Popover Content</h4>
              <p className="text-sm text-muted-foreground">
                Customize the content here using your components.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  },
}
