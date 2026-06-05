import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/forms/Combobox";
import { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

const meta = {
  title: "Forms/Combobox",
  component: Combobox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

const FRUITS = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape"];

// Component wrapper to manage internal state for Single selection
const SingleComboboxTemplate = (args: any) => {
  const [value, setValue] = React.useState<string>("");
  const anchor = React.useRef<HTMLInputElement | null>(null);

  return (
    <div className="w-[300px] min-h-[300px]">
      <Combobox
        {...args}
        value={value}
        onValueChange={(val) => {
          setValue(val as string);
          args.onValueChange?.(val);
        }}
      >
        <ComboboxInput
          ref={anchor}
          placeholder="Select a fruit..."
          showClear={!!value}
          disabled={args.disabled}
        />
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No fruits found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};

// Component wrapper to manage internal state for Multiple selection
const MultipleComboboxTemplate = (args: any) => {
  const [values, setValues] = React.useState<string[]>([]);
  const anchor = useComboboxAnchor();

  return (
    <div className="w-[350px] min-h-[300px]">
      <Combobox
        {...args}
        multiple
        value={values}
        onValueChange={(val) => {
          setValues(val as string[]);
          args.onValueChange?.(val);
        }}
      >
        <ComboboxChips ref={anchor} className="w-full">
          <ComboboxValue>
            {(selectedValues) => (
              <React.Fragment>
                {selectedValues.map((value: string) => (
                  <ComboboxChip key={value}>
                    {value}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder={values.length === 0 ? "Select fruits..." : ""} disabled={args.disabled} />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No fruits found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
};

export const Single: Story = {
  args: {
    items: FRUITS,
    autoHighlight: true,
  },
  render: (args) => <SingleComboboxTemplate {...args} />,
};

export const SingleDisabled: Story = {
  args: {
    items: FRUITS,
    autoHighlight: true,
    disabled: true,
  },
  render: (args) => <SingleComboboxTemplate {...args} />,
};

export const Multiple: Story = {
  args: {
    items: FRUITS,
    autoHighlight: true,
  },
  render: (args) => <MultipleComboboxTemplate {...args} />,
};

export const MultipleDisabled: Story = {
  args: {
    items: FRUITS,
    autoHighlight: true,
    disabled: true,
  },
  render: (args) => <MultipleComboboxTemplate {...args} />,
};
