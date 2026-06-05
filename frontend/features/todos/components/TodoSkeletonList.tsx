import React, { FC } from "react";
import { Card } from "@/components/Layout/Card";
import { Skeleton } from "@/components/Layout/Skeleton";

export const TodoSkeletonList: FC = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <Card key={idx} className="p-0 rounded-none flex flex-row gap-0">
          <div className="bg-accent/40 w-2" />
          <div className="m-5 w-full z-1 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <div className="flex justify-between">
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="space-y-1 flex flex-col items-end">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
