import { FieldDescription } from "@/components/forms/Field";
import { FieldWrapper } from "@/components/forms/FieldWrapper";
import { InputField } from "@/components/forms/FieldWrapper/components/InputField";
import { PasswordField } from "@/components/forms/FieldWrapper/components/PasswordField";
import { Separator } from "@/components/Layout/Separator/Separator";
import { Meta, StoryObj } from "@storybook/nextjs-vite";

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
