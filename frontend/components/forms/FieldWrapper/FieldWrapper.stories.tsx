import { FieldDescription } from "@/components/forms/Field";
import { FieldWrapper } from "@/components/forms/FieldWrapper";
import { ComboboxField } from "@/components/forms/FieldWrapper/components/ComboboxField";
import { InputField } from "@/components/forms/FieldWrapper/components/InputField";
import { InputGroupField } from "@/components/forms/FieldWrapper/components/InputGroupField";
import { PasswordField } from "@/components/forms/FieldWrapper/components/PasswordField";
import { SelectField } from "@/components/forms/FieldWrapper/components/SelectField";
import { Separator } from "@/components/Layout/Separator/Separator";
import { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

const meta = {
  title: "Forms/FieldWrapper",
  component: FieldWrapper,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof FieldWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

const description = (
  <div>
    <FieldDescription>description 1</FieldDescription>
    <FieldDescription>description 2</FieldDescription>
    <FieldDescription>description 3</FieldDescription>
  </div>
);

export const Default: Story = {
  args: {
    label: "User ID",
  },
  argTypes: {
    required: {
      control: false,
    },
  },
  decorators: [
    () => {
      return (
        <div className="flex flex-col gap-4">
          <InputField label="Label" />
          <Separator />
          <InputField label="Label" description={description} />
          <Separator />
          <InputField label="Label" errorText="Error texts." />
        </div>
      );
    },
  ],
};

export const Password: Story = {
  args: {
    label: "User ID",
  },
  decorators: [
    () => (
      <div className="flex flex-col gap-4">
        <PasswordField label="Password" />
        <Separator />
        <PasswordField label="Password" description={description} />
        <Separator />
        <PasswordField label="Password" errorText="Error texts." />
      </div>
    ),
  ],
};

export const InputGroup: Story = {
  args: {
    label: "Search Info",
  },
  decorators: [
    () => {
      return (
        <div className="flex flex-col gap-4 w-[300px]">
          <InputGroupField label="Search" placeholder="Search..." />
          <Separator />
          <InputGroupField label="Search" description={description} placeholder="Search..." />
          <Separator />
          <InputGroupField label="Search" errorText="Error texts." placeholder="Search..." />
        </div>
      );
    },
  ],
};

const FRUITS = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];

const ComboboxFieldDemo = () => {
  const [singleValue, setSingleValue] = React.useState<string | string[] | null>(null);
  const [multiValues, setMultiValues] = React.useState<string | string[] | null>([]);

  return (
    <div className="flex flex-col gap-4 w-[300px]">
      <ComboboxField
        label="Single Fruit"
        items={FRUITS}
        value={singleValue}
        onValueChange={setSingleValue}
        placeholder="Select a fruit..."
      />
      <Separator />
      <ComboboxField
        label="Multiple Fruits"
        items={FRUITS}
        multiple
        value={multiValues}
        onValueChange={setMultiValues}
        placeholder="Select fruits..."
      />
      <Separator />
      <ComboboxField
        label="With Error"
        items={FRUITS}
        value={singleValue}
        onValueChange={setSingleValue}
        errorText="This field is required."
        placeholder="Select a fruit..."
      />
    </div>
  );
};

export const Combobox: Story = {
  args: {
    label: "Fruits",
  },
  decorators: [
    () => <ComboboxFieldDemo />
  ],
};

const SelectFieldDemo = () => {
  const [value, setValue] = React.useState("");

  return (
    <div className="flex flex-col gap-4 w-[300px]">
      <SelectField
        label="Single Fruit"
        items={FRUITS}
        value={value}
        onValueChange={setValue}
        placeholder="Select a fruit..."
      />
      <Separator />
      <SelectField
        label="Single Fruit with Description"
        items={FRUITS}
        value={value}
        onValueChange={setValue}
        description={description}
        placeholder="Select a fruit..."
      />
      <Separator />
      <SelectField
        label="With Error"
        items={FRUITS}
        value={value}
        onValueChange={setValue}
        errorText="This field is required."
        placeholder="Select a fruit..."
      />
    </div>
  );
};

export const Select: Story = {
  args: {
    label: "Fruits",
  },
  decorators: [
    () => <SelectFieldDemo />
  ],
};