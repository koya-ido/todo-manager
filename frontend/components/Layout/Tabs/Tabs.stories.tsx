import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Layout/Tabs";
import { Meta, StoryObj } from "@storybook/nextjs-vite";
import * as React from "react";

const meta = {
  title: "Layout/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tabs defaultValue="tab1" className="w-[400px]" {...args}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="tab1">Account</TabsTrigger>
        <TabsTrigger value="tab2">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="p-4 border rounded-md mt-2">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="tab2" className="p-4 border rounded-md mt-2">
        Change your password here.
      </TabsContent>
    </Tabs>
  ),
};

export const Line: Story = {
  render: (args) => (
    <Tabs defaultValue="tab1" className="w-[400px]" {...args}>
      <TabsList variant="line" className="w-full border-b justify-start rounded-none bg-transparent p-0 gap-4">
        <TabsTrigger value="tab1">Account</TabsTrigger>
        <TabsTrigger value="tab2">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="p-4 mt-2">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="tab2" className="p-4 mt-2">
        Change your password here.
      </TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  render: (args) => (
    <Tabs defaultValue="tab1" orientation="vertical" className="w-[400px]" {...args}>
      <TabsList className="w-32 bg-muted p-1">
        <TabsTrigger value="tab1" className="w-full justify-start">Account</TabsTrigger>
        <TabsTrigger value="tab2" className="w-full justify-start">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="p-4 border rounded-md">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="tab2" className="p-4 border rounded-md">
        Change your password here.
      </TabsContent>
    </Tabs>
  ),
};
