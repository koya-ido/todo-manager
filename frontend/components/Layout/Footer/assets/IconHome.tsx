import { IconProps } from "@/components/icons/types";
import { FC } from "react";

/**
 * ホーム画面への遷移ボタンのアイコンコンポーネント
 * @param size - アイコンのサイズ(px)
 * @param color - アイコンの色
 * @returns ホーム画面への遷移ボタンのアイコン
 */
export const IconHome: FC<IconProps> = ({
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
      className="lucide lucide-house-icon lucide-house"
    >
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  );
};
