"use client";

import { ErrorProvider } from "@/components/features/ErrorProvider";
import { Toaster } from "@/components/Layout/Toaster";
import { FC, ReactNode } from "react";
import { LocaleSwitcher } from "@/components/features/LocaleSwitcher";

interface ClientLayoutProps {
  messages: Record<string, string>;
  locale: string;
  children: ReactNode;
}

export const ClientLayout: FC<ClientLayoutProps> = ({
  messages,
  locale,
  children,
}) => {
  return (
    <ErrorProvider messages={messages}>
      <LocaleSwitcher currentLocale={locale} />
      {children}
      <Toaster />
    </ErrorProvider>
  );
};
