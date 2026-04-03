"use client";

import { clearAccessToken } from "@/lib/server-actions";
import { isErrorResponse } from "@/hooks/useError/errorUtils";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef } from "react";

type AuthSessionProviderProps = {
  messages: Record<string, string>;
  children: ReactNode;
};

const SESSION_ERROR_CODES = new Set([
  "AUTHENTICATION_REQUIRED",
  "INVALID_TOKEN",
  "TOKEN_EXPIRED",
  "TOKEN_REVOKED",
]);

export const AuthSessionProvider = ({
  messages,
  children,
}: AuthSessionProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isHandlingRef = useRef(false);

  useEffect(() => {
    const handleAuthError = async (event: Event) => {
      const customEvent = event as CustomEvent<unknown>;
      const errorResponse = customEvent.detail;

      if (!isErrorResponse(errorResponse)) {
        return;
      }

      if (
        !SESSION_ERROR_CODES.has(errorResponse.code) ||
        isHandlingRef.current
      ) {
        return;
      }

      isHandlingRef.current = true;

      const message =
        messages[errorResponse.code] ??
        errorResponse.detail ??
        "Session expired. Please log in again.";

      window.alert(message);
      await clearAccessToken();

      if (pathname !== "/login") {
        router.push("/login");
      }

      router.refresh();
      isHandlingRef.current = false;
    };

    window.addEventListener("auth:error", handleAuthError as EventListener);
    return () => {
      window.removeEventListener(
        "auth:error",
        handleAuthError as EventListener,
      );
    };
  }, [messages, pathname, router]);

  return children;
};
