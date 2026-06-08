import { Card } from "@/components/Layout/Card";
import { FC } from "react";

type MetricCardProps = {
  title: string;
  value: number;
  unit: string;
};

/**
 * ダッシュボード用の統計情報カードコンポーネント
 */
export const MetricCard: FC<MetricCardProps> = ({ title, value, unit }) => {
  return (
    <Card className="flex flex-col items-center justify-center p-6 text-center bg-card rounded-2xl border border-border/50 shadow-xs hover:shadow-sm transition-all duration-200">
      <span className="text-sm text-muted-foreground font-medium mb-1">
        {title}
      </span>
      <div className="flex items-baseline gap-1 text-foreground">
        <span className="text-4xl font-extrabold tracking-tight">
          {value}
        </span>
        <span className="text-sm font-semibold">
          {unit}
        </span>
      </div>
    </Card>
  );
};
