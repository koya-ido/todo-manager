import { cn } from "@/lib/utils";
import { FC, JSX, ReactNode } from "react";

export const Heading: FC<{
  level: 1 | 2 | 3;
  className?: string;
  children: ReactNode;
}> = ({ level, className, children }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag
      className={cn(
        "font-bold leading-tight tracking-tighter",
        {
          "text-2xl md:text-5xl": level === 1,
          "text-xs md:text-[4xl]": level === 2,
          "text-1 md:text-3xl": level === 3,
        },
        className,
      )}
    >
      {children}
    </Tag>
  );
};
