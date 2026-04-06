"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { usePathname } from "next/navigation";
import { clearAccessToken } from "@/lib/server-actions";
import {
  registerAuthSessionErrorHandler,
  unregisterAuthSessionErrorHandler,
} from "@/components/features/AuthSessionProvider/authSessionStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/Layout/Dialog";
import { apiGet } from "@/hooks/useFetchApi";
import { isErrorResponse } from "@/hooks/useError/errorUtils";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

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
  const pathname = usePathname();
  const isHandlingRef = useRef(false);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isSessionValidated, setIsSessionValidated] = useState(false);

  const handleSessionError = useCallback(async (errorResponse: unknown) => {
    if (!isErrorResponse(errorResponse)) {
      return;
    }

    if (!SESSION_ERROR_CODES.has(errorResponse.code) || isHandlingRef.current) {
      return;
    }

    isHandlingRef.current = true;
    await clearAccessToken();
    setIsSessionValidated(false);
    setIsSessionExpired(true);
    isHandlingRef.current = false;
  }, []);

  useEffect(() => {
    registerAuthSessionErrorHandler(handleSessionError);
    return () => {
      unregisterAuthSessionErrorHandler();
    };
  }, [handleSessionError]);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      setIsSessionValidated(false);

      try {
        await apiGet("/me");
        if (isMounted) {
          setIsSessionValidated(true);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (isErrorResponse(error) && SESSION_ERROR_CODES.has(error.code)) {
          await handleSessionError(error);
          return;
        }

        if (isMounted) {
          setIsSessionValidated(true);
        }
      }
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, [handleSessionError, pathname]);

  return (
    <>
      {isSessionValidated ? children : null}
      <Dialog open={isSessionExpired}>
        <DialogContent
          showCloseButton={false}
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          className="flex flex-col items-center gap-6"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-chart-4">
              <TriangleAlert size={16} color="var(--chart-4)" />
              {messages["session-expired-dialog.title"]}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <p className="text-center">
              {messages["session-expired-dialog.description"]}
            </p>
            <Link
              href="/login"
              className="text-sm text-primary font-bold underline"
            >
              {messages["session-expired-dialog.confirm"]}
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
