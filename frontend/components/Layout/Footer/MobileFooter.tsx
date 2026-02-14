"use client";

import { IconPrivate } from "@/components/Layout/Footer/assets/IconPrivate";
import { IconTeam } from "@/components/Layout/Footer/assets/IconTeam";
import { IconUser } from "@/components/Layout/Footer/assets/IconUser";
import { FooterItem } from "@/components/Layout/Footer/FooterItem";
import { usePathname } from "next/navigation";
import { FC } from "react";

/**
 * スマホレイアウト用のフッターコンポーネント
 * @returns スマホレイアウト用のフッターコンポーネント
 */
export const MobileFooter: FC = () => {
  /** 現在のページ */
  const currentPath = usePathname();

  /** currentPathが引数と一致したらtrueを返す */
  const isActive = (path: string) => currentPath === path;

  return (
    <footer className="fixed bottom-0 flex justify-around items-center w-full bg-background h-16">
      <FooterItem
        href="/private"
        icon={
          <IconPrivate
            size={24}
            color={
              isActive("/private") ? "var(--background)" : "var(--foreground)"
            }
          />
        }
        label="private"
        isActive={isActive("/private")}
      />
      <FooterItem
        href="/team"
        icon={
          <IconTeam
            size={24}
            color={
              isActive("/team") ? "var(--background)" : "var(--foreground)"
            }
          />
        }
        label="team"
        isActive={isActive("/team")}
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
