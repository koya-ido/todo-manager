import { Heading } from "@/components/typography/Heading";
import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  className?: string;
};

export const PageHeader: FC<PageHeaderProps> = ({ title, description, className }) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Heading level={1} className="text-2xl font-bold flex items-center gap-2">
        {title}
      </Heading>
      {description && (
        <Heading level={2} className="text-muted-foreground text-sm">
          {description}
        </Heading>
      )}
    </div>
  );
};
