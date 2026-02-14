"use client";
import { useEffect, useState } from "react";

/**
 * レスポンシブデザインを実現するためのカスタムフック
 * @returns スマホレイアウトかどうかの状態を返すオブジェクト
 */
export const useResponsive = () => {
  // 1. 初期値は常に一定にする（サーバーとクライアントでズレないように）
  const [isMobileLayout, setIsMobileLayout] = useState<boolean>(false);

  useEffect(() => {
    // 2. ブラウザにマウントされた直後に一度実行
    const handleResize = () => {
      setIsMobileLayout(window.innerWidth <= 768);
    };

    handleResize(); // 初回実行

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);

    // 依存配列に window.innerWidth は不要（resizeイベントで検知するため）
  }, []);

  return { isMobileLayout };
};
