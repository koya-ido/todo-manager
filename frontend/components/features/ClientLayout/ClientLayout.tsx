"use client";

import { ErrorProvider } from "@/components/features/ErrorProvider";
import { LocaleProvider } from "@/components/features/LocaleProvider";
import { Toaster } from "@/components/Layout/Toaster";
import { FC, ReactNode } from "react";

type ClientLayoutProps = {
  messages: Record<string, string>;
  locale: string;
  children: ReactNode;
};

export const ClientLayout: FC<ClientLayoutProps> = ({
  messages,
  locale,
  children,
}) => {
  return (
    <LocaleProvider locale={locale}>
      <ErrorProvider messages={messages}>
        {children}
        <Toaster />
      </ErrorProvider>
    </LocaleProvider>
  );
};
