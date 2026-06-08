"use client";

import { Footer, Header } from "@/components/Layout";
import { apiGet } from "@/hooks/useFetchApi";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

type ContentProps = {
  messages: Record<string, string>;
};

export const Content: FC<ContentProps> = ({ messages }) => {
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
        {/* 見出し (404) */}
        <h2 className="text-[32px] font-extrabold tracking-tight text-foreground mb-4">
          {messages["breadcrumb.not-found"]}
        </h2>

        {/* 説明 */}
        <p className="text-md leading-relaxed mb-6 font-medium text-foreground">
          {messages["not-found.description"]}
        </p>

        {/* 詳細コンテンツ */}
        <p className="text-md leading-relaxed mb-8 text-foreground">
          {messages["not-found.content"]}
        </p>

        {/* 戻るナビゲーションリンク */}
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
