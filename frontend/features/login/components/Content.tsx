"use client";

import { Heading } from "@/components/typography/Heading";
import { LoginForm } from "@/features/login/components/LoginForm";
import { ContentProps } from "@/types/contentTypes";
import Link from "next/link";
import { FC } from "react";
import Image from "next/image";

export const Content: FC<ContentProps> = ({ messages }) => {
  return (
    <div className="flex flex-col w-full items-center justify-center gap-6">
      <Image
        src="/assets/icons/ApplicationLogo.svg"
        alt="アプリケーションロゴ"
        width={40}
        height={40}
      />
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
          href="/sign-up"
          className="text-sm text-primary font-bold underline"
        >
          {messages["login.sign-up.link"]}
        </Link>
      </section>
    </div>
  );
};
