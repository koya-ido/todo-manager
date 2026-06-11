"use client";

import { MobileHeader } from "@/components/Layout/Header/MobileHeader";
import { useResponsive } from "@/hooks/useResponsive";
import { FC } from "react";

/**
 * アプリヘッダーコンポーネント
 * @returns アプリヘッダー
 */
export const Header: FC = () => {
  /** スマホレイアウトか */
  const { isMobileLayout } = useResponsive();

  if (isMobileLayout) {
    return <MobileHeader />;
  }

  return null;
};
