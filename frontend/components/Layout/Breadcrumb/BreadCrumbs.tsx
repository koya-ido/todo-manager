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

  // 1. Home screen
  if (pathname === "/" || pathname === "/home") {
    return [
      {
        label: messages["breadcrumb.home"],
        href: null,
      },
    ];
  }

  // 2. Inbox screen
  if (pathname === "/inbox") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.inbox"],
        href: null,
      },
    ];
  }

  // 3. User screen
  if (pathname === "/user") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.user"],
        href: null,
      },
    ];
  }

  // 4. User settings screen
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

  // 5. User edit screen
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

  // 6. Team List screen
  if (pathname === "/team") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.team-list"],
        href: null,
      },
    ];
  }

  // 7. Team edit screen (create or edit)
  if (pathname === "/team/edit") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.team-list"],
        href: "/team",
      },
      {
        label: isNew
          ? messages["breadcrumb.team.create"] || "新規作成"
          : messages["breadcrumb.team.edit"] || "編集",
        href: null,
      },
    ];
  }

  // 8. Todo paths
  if (pathname.startsWith("/todo")) {
    const isTeamMode = mode === "team";

    // Parent list (either Team TODO or Private TODO)
    const listParentItems: TrailItem[] = isTeamMode
      ? [
        homeItem,
        {
          label: messages["breadcrumb.todo-list.team"],
          href: "/todo?mode=team",
        },
      ]
      : [
        homeItem,
        {
          label: messages["breadcrumb.todo-list.private"],
          href: "/todo?mode=private",
        },
      ];

    // If we are exactly at `/todo`
    if (pathname === "/todo") {
      // Modify the last item's href to be null because it's the current page
      const last = listParentItems[listParentItems.length - 1];
      return [...listParentItems.slice(0, -1), { ...last, href: null }];
    }

    // If we are at `/todo/deleted`
    if (pathname === "/todo/deleted") {
      return [
        ...listParentItems,
        {
          label: messages["breadcrumb.todo.deleted"],
          href: null,
        },
      ];
    }

    // If we are at `/todo/edit`
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
            ? messages["breadcrumb.todo.create"]
            : messages["breadcrumb.todo.edit"],
          href: null,
        },
      ];
    }

    // If we are at `/todo/[id]`
    // E.g. `/todo/123`
    return [
      ...listParentItems,
      {
        label: messages["breadcrumb.todo.detail"],
        href: null,
      },
    ];
  }

  // 9. Error page
  if (pathname === "/error") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.error"],
        href: null,
      },
    ];
  }

  // 10. Not Found page
  if (pathname === "/not-found") {
    return [
      homeItem,
      {
        label: messages["breadcrumb.not-found"],
        href: null,
      },
    ];
  }

  // Default fallback (just home)
  return [homeItem];
};

const BreadCrumbsContent: FC<BreadCrumbsProps> = ({ messages }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const trail = getTrail(pathname, searchParams, messages);

  // Return nothing if the trail has 0 or 1 items (like home itself has only 1 item)
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
