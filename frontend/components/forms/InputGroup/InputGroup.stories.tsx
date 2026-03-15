import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/forms/InputGroup";
import { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  CheckIcon,
  CopyIcon,
  CreditCardIcon,
  FileCodeIcon,
  Info,
  InfoIcon,
  MailIcon,
  Search,
  SearchIcon,
  Star,
  StarIcon,
} from "lucide-react";

const meta = {
  title: "Forms/InputGroup",
  component: InputGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  decorators: [
    () => (
      <InputGroup className="max-w-xs">
        <InputGroupInput placeholder="Search..." />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
      </InputGroup>
    ),
  ],
};

export const BlockStart: Story = {
  args: {},
  decorators: [
    () => (
      <div className="flex flex-col gap-4">
        <InputGroup className="h-auto">
          <InputGroupInput
            id="block-start-input"
            placeholder="Enter your name"
          />
          <InputGroupAddon align="block-start">
            <InputGroupText>Full Name</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea
            id="block-start-textarea"
            placeholder="console.log('Hello, world!');"
            className="font-mono text-sm"
          />
          <InputGroupAddon align="block-start">
            <FileCodeIcon className="text-muted-foreground" />
            <InputGroupText className="font-mono">script.js</InputGroupText>
            <InputGroupButton size="icon-xs" className="ml-auto">
              <CopyIcon />
              <span className="sr-only">Copy</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    ),
  ],
};

export const BlockEnd: Story = {
  args: {},
  decorators: [
    () => (
      <div className="flex flex-col gap-4">
        <InputGroup className="h-auto">
          <InputGroupInput id="block-end-input" placeholder="Enter amount" />
          <InputGroupAddon align="block-end">
            <InputGroupText>USD</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea
            id="block-end-textarea"
            placeholder="Write a comment..."
          />
          <InputGroupAddon align="block-end">
            <InputGroupText>0/280</InputGroupText>
            <InputGroupButton variant="default" size="sm" className="ml-auto">
              Post
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    ),
  ],
};

export const Icon: Story = {
  args: {},
  decorators: [
    () => (
      <div className="flex flex-col gap-4">
        <InputGroup>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput type="email" placeholder="Enter your email" />
          <InputGroupAddon>
            <MailIcon />
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="Card number" />
          <InputGroupAddon>
            <CreditCardIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <CheckIcon />
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="Card number" />
          <InputGroupAddon align="inline-end">
            <StarIcon />
            <InfoIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>
    ),
  ],
};

export const Text: Story = {
  args: {},
  decorators: [
    () => (
      <div className="flex flex-col gap-4">
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>$</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="0.00" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>USD</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="example.com" className="pl-0.5!" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>.com</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="Enter your username" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>@company.com</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea placeholder="Enter your message" />
          <InputGroupAddon align="block-end">
            <InputGroupText className="text-xs text-muted-foreground">
              120 characters left
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    ),
  ],
};

export const Button: Story = {
  args: {},
  decorators: [
    () => (
      <div className="flex flex-col gap-4">
        <InputGroup>
          <InputGroupInput placeholder="https://x.com/shadcn" readOnly />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Copy"
              title="Copy"
              size="icon-xs"
              onClick={() => {}}
            >
              <CopyIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup className="[--radius:9999px]">
          <InputGroupAddon>
            <InputGroupButton variant="secondary" size="icon-xs">
              <Info />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupAddon className="pl-1.5 text-muted-foreground">
            https://
          </InputGroupAddon>
          <InputGroupInput id="input-secure-19" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={() => {}} size="icon-xs">
              <Star
                data-favorite={true}
                className="data-[favorite=true]:fill-blue-600 data-[favorite=true]:stroke-blue-600"
              />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="Type to search..." />
          <InputGroupAddon align="inline-end">
            <InputGroupButton variant="secondary">Search</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    ),
  ],
};
