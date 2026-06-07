"use client";

import { Footer, Header } from "@/components/Layout";
import { apiGet } from "@/hooks/useFetchApi";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

type NotFoundContentProps = {
  messages: Record<string, string>;
};

export const NotFoundContent: FC<NotFoundContentProps> = ({ messages }) => {
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiGet("/me")
      .then(() => {
        if (isMounted) {
          setIsValidToken(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsValidToken(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Header />
      <div className="w-full max-w-lg mx-auto flex flex-col items-start justify-start py-4">
        {/* Heading (404) */}
        <h2 className="text-[32px] font-extrabold tracking-tight text-foreground mb-4">
          {messages["breadcrumb.not-found"]}
        </h2>

        {/* Description */}
        <p className="text-md leading-relaxed mb-6 font-medium text-foreground">
          {messages["not-found.description"]}
        </p>

        {/* Detailed Content */}
        <p className="text-md leading-relaxed mb-8 text-foreground">
          {messages["not-found.content"]}
        </p>

        {/* Back navigation link */}
        <div className="w-full flex justify-center mt-10">
          {isValidToken === null ? (
            <div className="h-6 w-32 bg-muted/60 animate-pulse rounded" />
          ) : isValidToken ? (
            <Link
              href="/home"
              className="text-md font-bold underline text-foreground hover:opacity-85"
            >
              {messages["common.back-home"]}
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-md font-bold underline text-foreground hover:opacity-85"
            >
              {messages["session-expired-dialog.confirm"]}
            </Link>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};
