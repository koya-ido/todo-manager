import { IconProps } from "@/components/icons/types";
import { FC } from "react";

/**
 * プライベートTODO画面への遷移ボタンのアイコンコンポーネント
 * @param size - アイコンのサイズ(px)
 * @param color - アイコンの色
 * @returns プライベートTODO画面への遷移ボタンのアイコン
 */
export const IconTodo: FC<IconProps> = ({
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
      className="lucide lucide-circle-check-icon lucide-circle-check"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
};
