import { Calendar } from "@/components/Layout/Calender"
import { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"

const meta = {
  title: "Layout/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    mode: "single",
    showOutsideDays: true,
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [date, setDate] = React.useState<Date | undefined>(new Date())
    return (
      <div className="flex flex-col items-center gap-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
        />
        <p className="text-sm text-muted-foreground">
          Selected Date: {date ? date.toLocaleDateString() : "None"}
        </p>
      </div>
    )
  },
}
