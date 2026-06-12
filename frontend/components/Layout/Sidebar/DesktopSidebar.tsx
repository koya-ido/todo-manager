"use client";

import { IconHome } from "@/components/Layout/Footer/assets/IconHome";
import { IconTeam } from "@/components/Layout/Footer/assets/IconTeam";
import { IconTodo } from "@/components/Layout/Footer/assets/IconTodo";
import { IconUser } from "@/components/Layout/Footer/assets/IconUser";
import { IconBellActive } from "@/components/Layout/Header/assets/IconBellActive";
import { IconBellInactive } from "@/components/Layout/Header/assets/IconBellInactive";
import { apiGet } from "@/hooks/useFetchApi";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";

type DesktopSidebarProps = {
  className?: string;
};

export const DesktopSidebar: FC<DesktopSidebarProps> = ({ className }) => {
  const currentPath = usePathname();
  const searchParams = useSearchParams();
  const [isBellActive, setIsBellActive] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    const checkInbox = async () => {
      try {
        const data = await apiGet<{ count: number }>("/inbox/unread");
        if (isMounted) {
          setIsBellActive(data.count > 0);
          setUnreadCount(data.count);
        }
      } catch {
        if (isMounted) {
          setIsBellActive(false);
          setUnreadCount(0);
        }
      }
    };

    void checkInbox();

    return () => {
      isMounted = false;
    };
  }, [currentPath]);

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
    if (path.includes("user")) {
      return (
        currentPath.includes("user") ||
        searchParams.toString().includes("user")
      );
    }

    const [targetPathname, targetQueryStr] = path.split("?");

    if (currentPath !== targetPathname) {
      return false;
    }

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

  const navItems = [
    {
      href: "/home",
      label: "Home",
      icon: (active: boolean) => (
        <IconHome size={24} color={active ? "var(--background)" : "var(--foreground)"} />
      ),
    },
    {
      href: "/todo?mode=private",
      label: "Private",
      icon: (active: boolean) => (
        <IconTodo size={24} color={active ? "var(--background)" : "var(--foreground)"} />
      ),
    },
    {
      href: "/team",
      label: "Team",
      icon: (active: boolean) => (
        <IconTeam size={24} color={active ? "var(--background)" : "var(--foreground)"} />
      ),
    },
    {
      href: "/user",
      label: "User",
      icon: (active: boolean) => (
        <IconUser size={24} color={active ? "var(--background)" : "var(--foreground)"} />
      ),
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-64 border-r border-solid border-border bg-card flex flex-col justify-between p-4 z-40 ${className}`}
    >
      <div className="flex flex-col gap-8">
        {/* ロゴ部分 */}
        <div className="flex items-center px-2 py-4 border-b border-solid border-border/50">
          <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-primary to-slate-500 bg-clip-text text-transparent">
            TODO Manager
          </span>
        </div>

        {/* ナビゲーションメニュー */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-lg transition-colors text-sm font-semibold ${active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                {item.icon(active)}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* インボックス・フッター領域 */}
      <div className="flex flex-col gap-3">
        {/* Inboxへのリンク */}
        <Link
          href="/inbox"
          className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-sm font-semibold ${isActive("/inbox")
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
        >
          <div className="flex items-center gap-3.5">
            {isBellActive ? (
              <IconBellActive size={24} color={isActive("/inbox") ? "var(--background)" : "var(--foreground)"} />
            ) : (
              <IconBellInactive size={24} color={isActive("/inbox") ? "var(--background)" : "var(--foreground)"} />
            )}
            <span>Inbox</span>
          </div>
          {unreadCount > 0 && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-bold ${isActive("/inbox")
                ? "bg-background text-foreground"
                : "bg-destructive text-background"
                }`}
            >
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
};
