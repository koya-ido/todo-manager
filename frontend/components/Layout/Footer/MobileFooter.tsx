"use client";

import { IconHome } from "@/components/Layout/Footer/assets/IconHome";
import { IconTeam } from "@/components/Layout/Footer/assets/IconTeam";
import { IconTodo } from "@/components/Layout/Footer/assets/IconTodo";
import { IconUser } from "@/components/Layout/Footer/assets/IconUser";
import { FooterItem } from "@/components/Layout/Footer/FooterItem";
import { usePathname, useSearchParams } from "next/navigation";
import { FC } from "react";

/**
 * スマホレイアウト用のフッターコンポーネント
 * @returns スマホレイアウト用のフッターコンポーネント
 */
export const MobileFooter: FC = () => {
  /** 現在のページ */
  const currentPath = usePathname();
  const searchParams = useSearchParams();

  /** pathと現在のURLが一致しているか判定する */
  const isActive = (path: string) => {
    if (path.includes("private")) {
      return (
        currentPath.includes("private") ||
        searchParams.toString().includes("private")
      );
    }
    if (path.includes("team")) {
      return (
        currentPath.includes("team") ||
        searchParams.toString().includes("team")
      );
    }

    const [targetPathname, targetQueryStr] = path.split("?");

    // パス部分のチェック
    if (currentPath !== targetPathname) {
      return false;
    }

    // クエリパラメータのチェック
    if (targetQueryStr) {
      const targetParams = new URLSearchParams(targetQueryStr);
      for (const [key, value] of targetParams.entries()) {
        const currentValue =
          searchParams.get(key) || (key === "mode" ? "private" : null);
        if (currentValue !== value) {
          return false;
        }
      }
    }

    return true;
  };

  return (
    <footer className="fixed bottom-0 flex justify-around items-center w-full bg-background h-16 z-[100]">
      <FooterItem
        href="/home"
        icon={
          <IconHome
            size={24}
            color={
              isActive("/home") ? "var(--background)" : "var(--foreground)"
            }
          />
        }
        label="home"
        isActive={isActive("/home")}
      />
      <FooterItem
        href="/todo?mode=private"
        icon={
          <IconTodo
            size={24}
            color={
              isActive("/todo?mode=private") ? "var(--background)" : "var(--foreground)"
            }
          />
        }
        label="private"
        isActive={isActive("/todo?mode=private")}
      />
      <FooterItem
        href="/todo?mode=team"
        icon={
          <IconTeam
            size={24}
            color={
              isActive("/todo?mode=team")
                ? "var(--background)"
                : "var(--foreground)"
            }
          />
        }
        label="team"
        isActive={isActive("/todo?mode=team")}
      />
      <FooterItem
        href="/user"
        icon={
          <IconUser
            size={24}
            color={
              isActive("/user") ? "var(--background)" : "var(--foreground)"
            }
          />
        }
        label="user"
        isActive={isActive("/user")}
      />
    </footer>
  );
};
