import { FC } from "react";

/**
 * ホーム画面ローディング用のスケルトンコンポーネント
 */
export const HomeSkeleton: FC = () => (
  <div className="w-full max-w-2xl mx-auto space-y-6 animate-pulse px-1">
    {/* タイトルと挨拶のスケルトン */}
    <div className="space-y-3">
      <div className="h-8 w-24 bg-muted rounded-md" />
      <div className="h-5 w-48 bg-muted rounded-md" />
    </div>

    {/* カードのスケルトン */}
    <div className="grid grid-cols-2 gap-4">
      <div className="h-28 bg-card border border-border/50 rounded-2xl" />
      <div className="h-28 bg-card border border-border/50 rounded-2xl" />
    </div>

    {/* ボタンのスケルトン */}
    <div className="h-12 bg-card border border-border/50 rounded-xl" />

    {/* リストヘッダーのスケルトン */}
    <div className="flex justify-between items-center mt-8">
      <div className="h-6 w-48 bg-muted rounded-md" />
      <div className="h-5 w-10 bg-muted rounded-full" />
    </div>

    {/* リストカードのスケルトン */}
    <div className="space-y-3">
      <div className="h-20 bg-card border border-border/50 rounded-2xl" />
      <div className="h-20 bg-card border border-border/50 rounded-2xl" />
    </div>
  </div>
);
