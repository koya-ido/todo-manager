"use client";

import { IconHome } from "@/components/Layout/Footer/assets/IconHome";
import { IconStash } from "@/components/Layout/Footer/assets/IconStash";
import { IconTodo } from "@/components/Layout/Footer/assets/IconTodo";
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
        href="/private"
        icon={
          <IconTodo
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
        href="/private?mode=stash"
        icon={
          <IconStash
            size={24}
            color={
              isActive("/private?mode=stash")
                ? "var(--background)"
                : "var(--foreground)"
            }
          />
        }
        label="stash"
        isActive={isActive("/private?mode=stash")}
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
