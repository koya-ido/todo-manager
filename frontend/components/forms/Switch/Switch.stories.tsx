import { Field, FieldLabel } from "@/components/forms/Field";
import { Switch } from "@/components/forms/Switch";
import { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

const meta = {
  title: "Forms/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Switch>;

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

export const Disabled: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-4">
        <Field orientation="horizontal">
          <Switch id="disabled-unchecked" disabled />
          <FieldLabel htmlFor="disabled-unchecked" className="text-sm font-medium">Unchecked (Disabled)</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Switch id="disabled-checked" defaultChecked disabled />
          <FieldLabel htmlFor="disabled-checked" className="text-sm font-medium">Checked (Disabled)</FieldLabel>
        </Field>
      </div>
    );
  },
};

export const WithLabel: Story = {
  render: () => {
    return (
      <Field orientation="horizontal">
        <Switch id="toggle-deleted" />
        <FieldLabel htmlFor="toggle-deleted" className="cursor-pointer text-sm font-medium">
          Show deleted only
        </FieldLabel>
      </Field>
    );
  },
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = React.useState<boolean>(false);
    return (
      <div className="flex flex-col gap-4 items-center">
        <Field orientation="horizontal">
          <Switch id="controlled" checked={checked} onCheckedChange={setChecked} />
          <FieldLabel htmlFor="controlled" className="cursor-pointer text-sm font-medium">
            Controlled Switch
          </FieldLabel>
        </Field>
        <div className="flex gap-2">
          <button
            onClick={() => setChecked(true)}
            className="px-2 py-1 text-xs border rounded bg-secondary hover:bg-secondary/80 cursor-pointer"
          >
            Turn On
          </button>
          <button
            onClick={() => setChecked(false)}
            className="px-2 py-1 text-xs border rounded bg-secondary hover:bg-secondary/80 cursor-pointer"
          >
            Turn Off
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          Current state: <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{String(checked)}</code>
        </p>
      </div>
    );
  },
};
