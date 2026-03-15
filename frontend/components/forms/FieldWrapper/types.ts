import { Field } from "@/components/forms/Field";
import { ComponentProps, ReactNode } from "react";

export type FieldWrapperProps = Omit<
  ComponentProps<typeof Field>,
  "onChange"
> & {
  label: string;
  required?: boolean;
  description?: ReactNode;
  errorText?: string;
};
