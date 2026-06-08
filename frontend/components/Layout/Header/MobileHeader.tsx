import { IconBellActive } from "@/components/Layout/Header/assets/IconBellActive";
import { IconBellInactive } from "@/components/Layout/Header/assets/IconBellInactive";
import { apiGet } from "@/hooks/useFetchApi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC, useEffect, useState } from "react";

/**
 * スマホレイアウト用のヘッダーコンポーネント
 * @returns スマホレイアウト用のヘッダー
 */
export const MobileHeader: FC = () => {
  const [isBellActive, setIsBellActive] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    const checkInbox = async () => {
      try {
        const data = await apiGet<{ count: number }>("/inbox/unread");
        if (isMounted) {
          setIsBellActive(data.count > 0);
        }
      } catch {
        if (isMounted) {
          setIsBellActive(false);
        }
      }
    };

    void checkInbox();

    return () => {
      isMounted = false;
    };
  }, [pathname]);


  const labelClass = "text-xs";

  return (
    <header className="fixed top-0 flex justify-between items-center w-full bg-background px-3 py-2 z-[100]">
      <h1 className="text-md font-bold">TODO Manager</h1>
      <div className="flex items-center gap-3">
        <Link href="/inbox">
          <div className="flex flex-col justify-center items-center">
            {isBellActive ? (
              <IconBellActive size={24} color="var(--foreground)" />
            ) : (
              <IconBellInactive size={24} color="var(--foreground)" />
            )}
            <span
              className={`${labelClass} font-bold`}
            >
              Inbox
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
