"use client";

import { MobileFooter } from "@/components/Layout/Footer/MobileFooter";
import { useResponsive } from "@/hooks/useResponsive";
import { FC } from "react";

/**
 * アプリフッターコンポーネント
 * @returns アプリフッター
 */
export const Footer: FC = () => {
  /** スマホレイアウトか */
  const { isMobileLayout } = useResponsive();

  if (isMobileLayout) {
    return <MobileFooter />;
  }

  // TODO: PCレイアウトの実装
  return (
    <footer className="w-full border-t border-solid border-gray-200 py-4 text-center">
      <p className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Todo Manager. All rights reserved.
      </p>
    </footer>
  );
};
