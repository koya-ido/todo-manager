import { IconBellActive } from "@/components/Layout/Header/assets/IconBellActive";
import { IconBellInactive } from "@/components/Layout/Header/assets/IconBellInactive";
import { LogoutButton } from "@/components/features/LogoutButton";
import Link from "next/link";
import { FC, useState } from "react";

/**
 * スマホレイアウト用のヘッダーコンポーネント
 * @returns スマホレイアウト用のヘッダー
 */
export const MobileHeader: FC = () => {
  const [isBellActive] = useState<boolean>(true);

  const labelClass = "text-xs";

  return (
    <header className="fixed top-0 flex justify-between items-center w-full bg-background px-3 py-2">
      <h1 className="text-md font-bold">TODO Manager</h1>
      <div className="flex items-center gap-3">
        <Link href="/inbox">
          <div className="flex flex-col justify-center items-center">
            {isBellActive ? (
              <IconBellActive size={24} color="var(--foreground)" />
            ) : (
              <IconBellInactive size={24} color="var(--foreground)" />
            )}
            <span className={`${labelClass} ${isBellActive ? "font-bold" : ""}`}>
              Inbox
            </span>
          </div>
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
};
