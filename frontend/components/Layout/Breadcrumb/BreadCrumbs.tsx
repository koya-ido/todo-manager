"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/Layout/Breadcrumb/Breadcrumb";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { FC, Suspense } from "react";

type BreadCrumbsProps = {
  messages: Record<string, string>;
};

type TrailItem = {
  label: string;
  href: string | null;
};

const getTrail = (
  pathname: string,
  searchParams: URLSearchParams,
  messages: Record<string, string>,
): TrailItem[] => {
  const mode = searchParams.get("mode") || "private";
  const isNew = searchParams.get("isNew") === "true";

  const homeItem: TrailItem = {
    label: messages["breadcrumb.home"],
    href: "/home",
  };

  // 1. ホーム画面
  if (pathname === "/" || pathname === "/home") {
    return [
      {
        label: messages["breadcrumb.home"],
        href: null,
      },
    ];
  }

  // 2. インボックス画面
  if (pathname === "/inbox") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.inbox"],
        href: null,
      },
    ];
  }

  // 3. ユーザー画面
  if (pathname === "/user") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.user"],
        href: null,
      },
    ];
  }

  // 4. ユーザー設定画面
  if (pathname === "/user/setting") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.user"],
        href: "/user",
      },
      {
        label: messages["breadcrumb.user.setting"],
        href: null,
      },
    ];
  }

  // 5. ユーザー編集画面
  if (pathname === "/user/edit") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.user"],
        href: "/user",
      },
      {
        label: messages["breadcrumb.user.edit"],
        href: null,
      },
    ];
  }

  // 6. チーム一覧画面
  if (pathname === "/team") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.team-list"],
        href: null,
      },
    ];
  }

  // 6.5. チーム詳細画面
  if (pathname.startsWith("/team/") && pathname !== "/team/edit") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.team-list"],
        href: "/team",
      },
      {
        label: messages["team.detail.heading"],
        href: null,
      },
    ];
  }

  // 7. チーム編集画面（新規作成または編集）
  if (pathname === "/team/edit") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.team-list"],
        href: "/team",
      },
      {
        label: isNew
          ? messages["common.create"]
          : messages["common.edit"],
        href: null,
      },
    ];
  }

  // 8. Todoパス
  if (pathname.startsWith("/todo")) {
    const isTeamMode = mode === "team";

    // 親リスト（チームTODOまたは個人TODOのいずれか）
    const listParentItems: TrailItem[] = isTeamMode
      ? [
        homeItem,
        {
          label: messages["breadcrumb.team-list"],
          href: "/team",
        },
        {
          label: messages["breadcrumb.todo-list.team"],
          href: `/todo?mode=team${searchParams.get("teamId") ? `&teamId=${searchParams.get("teamId")}` : ""}`,
        },
      ]
      : [
        homeItem,
        {
          label: messages["breadcrumb.todo-list.private"],
          href: "/todo?mode=private",
        },
      ];

    // もし "/todo" にいる場合
    if (pathname === "/todo") {
      // 現在のページであるため、最後の項目のhrefをnullに変更する
      const last = listParentItems[listParentItems.length - 1];
      return [...listParentItems.slice(0, -1), { ...last, href: null }];
    }

    // もし "/todo/deleted" にいる場合
    if (pathname === "/todo/deleted") {
      return [
        ...listParentItems,
        {
          label: messages["breadcrumb.todo.deleted"],
          href: null,
        },
      ];
    }

    // もし "/todo/edit" にいる場合
    if (pathname === "/todo/edit") {
      const id = searchParams.get("id");
      return [
        ...listParentItems,
        ...(!isNew && id
          ? [
            {
              label: messages["breadcrumb.todo.detail"],
              href: `/todo/${id}?mode=${mode}`,
            },
          ]
          : []),
        {
          label: isNew
            ? messages["common.create"]
            : messages["common.edit"],
          href: null,
        },
      ];
    }

    // もし "/todo/[id]" にいる場合
    // 例: "/todo/123"
    return [
      ...listParentItems,
      {
        label: messages["breadcrumb.todo.detail"],
        href: null,
      },
    ];
  }

  // 9. エラーページ
  if (pathname === "/error") {
    return [];
  }

  // 10. 404ページ
  if (pathname === "/not-found") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.not-found"],
        href: null,
      },
    ];
  }

  // デフォルトのフォールバック（ホームのみ）
  return [homeItem];
};

const BreadCrumbsContent: FC<BreadCrumbsProps> = ({ messages }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const trail = getTrail(pathname, searchParams, messages);

  // パンくずリストの項目数が0または1の場合（ホーム自体は1項目のみなど）、何も返さない
  if (trail.length <= 1) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : item.href === "back" ? (
                  <BreadcrumbLink asChild>
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="cursor-pointer"
                    >
                      {item.label}
                    </button>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export const BreadCrumbs: FC<BreadCrumbsProps> = ({ messages }) => {
  return (
    <Suspense fallback={null}>
      <BreadCrumbsContent messages={messages} />
    </Suspense>
  );
};
