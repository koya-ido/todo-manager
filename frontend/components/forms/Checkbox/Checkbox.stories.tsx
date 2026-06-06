import { Checkbox } from "@/components/forms/Checkbox";
import { Field, FieldLabel } from "@/components/forms/Field";
import { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    checked: "indeterminate",
  },
};

export const Disabled: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-4">
        <Field orientation="horizontal">
          <Checkbox id="disabled-unchecked" disabled />
          <FieldLabel htmlFor="disabled-unchecked" className="text-sm font-medium">Unchecked (Disabled)</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="disabled-checked" defaultChecked disabled />
          <FieldLabel htmlFor="disabled-checked" className="text-sm font-medium">Checked (Disabled)</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="disabled-indeterminate" checked="indeterminate" disabled />
          <FieldLabel htmlFor="disabled-indeterminate" className="text-sm font-medium">Indeterminate (Disabled)</FieldLabel>
        </Field>
      </div>
    );
  },
};

export const WithLabel: Story = {
  render: () => {
    return (
      <Field orientation="horizontal">
        <Checkbox id="terms" />
        <FieldLabel htmlFor="terms" className="cursor-pointer text-sm font-medium">
          Accept terms and conditions
        </FieldLabel>
      </Field>
    );
  },
};

export const Controlled: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [checked, setChecked] = React.useState<boolean | "indeterminate">(false);
    return (
      <div className="flex flex-col gap-4 items-center">
        <Field orientation="horizontal">
          <Checkbox id="controlled" checked={checked} onCheckedChange={setChecked} />
          <FieldLabel htmlFor="controlled" className="cursor-pointer text-sm font-medium">
            Controlled Checkbox
          </FieldLabel>
        </Field>
        <div className="flex gap-2">
          <button
            onClick={() => setChecked(true)}
            className="px-2 py-1 text-xs border rounded bg-secondary hover:bg-secondary/80"
          >
            Check
          </button>
          <button
            onClick={() => setChecked(false)}
            className="px-2 py-1 text-xs border rounded bg-secondary hover:bg-secondary/80"
          >
            Uncheck
          </button>
          <button
            onClick={() => setChecked("indeterminate")}
            className="px-2 py-1 text-xs border rounded bg-secondary hover:bg-secondary/80"
          >
            Indeterminate
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Current state: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{String(checked)}</code>
        </p>
      </div>
    );
  },
};
