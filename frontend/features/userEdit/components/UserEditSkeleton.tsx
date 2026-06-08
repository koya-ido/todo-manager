import { Card } from "@/components/Layout/Card";
import { Skeleton } from "@/components/Layout/Skeleton";
import { FC } from "react";

export const UserEditSkeleton: FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-pulse">
      <div className="space-y-2 py-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card className="p-6 rounded-xl border bg-card space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  );
};
