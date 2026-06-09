import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export const PageContainer: FC<PageContainerProps> = ({ children, className }) => {
  return <div className={cn("w-full space-y-6", className)}>{children}</div>;
};
