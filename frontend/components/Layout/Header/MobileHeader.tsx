import { IconBellActive } from "@/components/Layout/Header/assets/IconBellActive";
import { IconBellInactive } from "@/components/Layout/Header/assets/IconBellInactive";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

/**
 * スマホレイアウト用のヘッダーコンポーネント
 * @returns スマホレイアウト用のヘッダー
 */
export const MobileHeader: FC = () => {
  const [isBellActive, setIsBellActive] = useState<boolean>(false);

  const labelClass = "text-xs";

  useEffect(() => {
    // TODO: APIから通知の有無を取得してisBellActiveを更新する処理を実装
    setIsBellActive(true); // 仮で通知がある状態にする
  }, []);

  return (
    <header className="fixed top-0 flex justify-between items-center w-full bg-background px-3 py-2">
      <h1 className="text-md font-bold">TODO Manager</h1>
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
    </header>
  );
};
