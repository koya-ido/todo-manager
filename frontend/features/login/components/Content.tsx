"use client";

import { Heading } from "@/components/typography/Heading";
import { LoginForm } from "@/features/login/components/LoginForm";
import Link from "next/link";
import { FC } from "react";

type ContentProps = {
  messages: Record<string, string>;
};

export const Content: FC<ContentProps> = ({ messages }) => {
  return (
    <div className="flex flex-col w-full items-center justify-center gap-6">
      <img src="/assets/icons/ApplicationLogo.svg" alt="アプリケーションロゴ" />
      <section className="flex flex-col items-center gap-2">
        <Heading level={1} className="text-2xl font-bold">
          TODO Manager
        </Heading>
        <Heading level={2} className="font-normal">
          {messages["login.heading"]}
        </Heading>
      </section>
      <LoginForm messages={messages} />
      <section className="flex flex-col items-center gap-2">
        <p>{messages["login.sign-up.sentence"]}</p>
        <Link
          href="/signup"
          className="text-sm text-primary font-bold underline"
        >
          {messages["login.sign-up.link"]}
        </Link>
      </section>
    </div>
  );
};
