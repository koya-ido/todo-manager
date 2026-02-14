import { FooterItemProps } from "@/components/Layout/Footer/types";
import Link from "next/link";
import { FC } from "react";

/**
 * フッターアイテムコンポーネント
 * @param href - 画面遷移先URL
 * @param icon - フッターに表示するアイコン
 * @param label - フッターに表示するテキスト
 * @param isActive - 現在のページと遷移先が同じかどうか
 * @returns フッターに表示する画面遷移ボタン
 */
export const FooterItem: FC<FooterItemProps> = ({
  href,
  icon,
  label,
  isActive,
}) => {
  const defaultClass = "flex flex-col items-center text-sm bg-transparent";
  const iconClass = `p-2 rounded-full ${isActive ? "bg-foreground" : "bg-transparent"}`;
  const labelClass = `text-xs ${isActive ? "font-bold" : ""}`;

  return (
    <Link href={href} className={defaultClass}>
      <div className={iconClass}>{icon}</div>
      <span className={labelClass}>{label}</span>
    </Link>
  );
};
