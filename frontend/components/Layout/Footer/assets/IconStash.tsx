import { IconProps } from "@/components/icons/types";
import { FC } from "react";

/**
 * 削除済みプライベートTODO一覧画面への遷移ボタンのアイコンコンポーネント
 * @param size - アイコンのサイズ(px)
 * @param color - アイコンの色
 * @returns 削除済みプライベートTODO一覧画面への遷移ボタンのアイコン
 */
export const IconStash: FC<IconProps> = ({
  size = 24,
  color = "var(--foreground)",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="lucide lucide-trash2-icon lucide-trash-2"
    >
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
};
