"use client";

import { Footer, Header } from "@/components/Layout";
import { apiGet } from "@/hooks/useFetchApi";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

type ErrorContentProps = {
  messages: Record<string, string>;
  status?: string;
  code?: string;
};

const getStatusText = (status: string) => {
  switch (status) {
    case "400": return "Bad Request";
    case "401": return "Unauthorized";
    case "403": return "Forbidden";
    case "404": return "Not Found";
    case "500": return "Internal Server Error";
    case "502": return "Bad Gateway";
    case "503": return "Service Unavailable";
    case "504": return "Gateway Timeout";
    default: return "Internal Server Error";
  }
};

export const ErrorContent: FC<ErrorContentProps> = ({
  messages,
  status = "500",
  code = "XXX",
}) => {
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const statusText = getStatusText(status);

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
        {/* Title */}
        <h2 className="text-[32px] font-extrabold tracking-tight text-foreground mb-4">
          {messages["error.heading"]}
        </h2>

        {/* Subtitle / Description */}
        <p className="text-md leading-relaxed mb-6 text-foreground">
          {messages["error.description"]}
        </p>

        {/* Error Details */}
        <div className="flex flex-col gap-1.5 mb-8 text-foreground">
          <p className="text-md font-medium">
            {status} {statusText}.
          </p>
          <p className="text-md text-muted-foreground">
            ERROR_CODE: {code}
          </p>
        </div>

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
