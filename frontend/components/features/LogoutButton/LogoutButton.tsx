"use client";

import { Button } from "@/components/forms/Button";
import { apiPost } from "@/hooks/useFetchApi";
import { clearAccessToken } from "@/lib/server-actions";
import { useRouter } from "next/navigation";

export const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiPost("/logout");
    } catch {
      // Cookie削除を優先するため、API失敗時もフロント側のログアウトは継続する。
    }

    await clearAccessToken();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button type="button" size="sm" onClick={handleLogout}>
      Logout
    </Button>
  );
};
