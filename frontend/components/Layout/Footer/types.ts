import { ReactNode } from "react";

/** FooterItemコンポーネントのPropsの型 */
export interface FooterItemProps {
  /** 画面遷移先URL */
  href: string;
  /** フッターに表示するアイコン */
  icon: ReactNode;
  /** アイコン下に表示するテキスト */
  label: string;
  /** 現在のページと遷移先が同じかどうか */
  isActive: boolean;
}
