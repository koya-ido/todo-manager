"use client";

import { apiGet } from "@/hooks/useFetchApi";
import { ReactNode, useEffect, useState } from "react";

type AuthGuardProps = {
  children: ReactNode;
};

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const validateSession = async () => {
      try {
        await apiGet("/me");
        if (isMounted) {
          setIsAuthorized(true);
        }
      } catch {
        if (isMounted) {
          setIsAuthorized(false);
        }
      }
    };

    void validateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isAuthorized) {
    return null;
  }

  return children;
};
