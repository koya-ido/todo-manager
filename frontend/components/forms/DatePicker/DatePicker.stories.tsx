import { DatePicker } from "@/components/forms/DatePicker"
import { Meta, StoryObj } from "@storybook/nextjs-vite"
import * as React from "react"

const meta = {
  title: "Forms/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [date, setDate] = React.useState<Date | undefined>()
    return (
      <div className="w-[300px] flex flex-col gap-4">
        <DatePicker value={date} onChange={setDate} />
        <p className="text-sm text-muted-foreground text-center">
          Selected: {date ? date.toLocaleDateString() : "None"}
        </p>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => {
    return (
      <div className="w-[300px]">
        <DatePicker disabled placeholder="Cannot select date" />
      </div>
    )
  },
}
