import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * カードコンポーネント
 * @returns カード
 */
const Card = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="card"
      className={cn(
        "w-full bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-6 shadow-sm",
        className,
      )}
      {...props}
    />
  );
};

/**
 * カードヘッダーコンポーネント
 * @returns カードヘッダー
 */
const CardHeader = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
};

/**
 * カードタイトルコンポーネント
 * @returns カードタイトル
 */
const CardTitle = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
};

/**
 * カード説明コンポーネント
 * @returns カード説明
 */
const CardDescription = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
};

/**
 * カードアクションコンポーネント
 * @returns カードアクション
 */
const CardAction = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
};

/**
 * カードコンテンツコンポーネント
 * @returns カードコンテンツ
 */
const CardContent = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
};

/**
 * カードフッターコンポーネント
 * @returns カードフッター
 */
const CardFooter = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
};

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
