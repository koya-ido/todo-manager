import { Button } from "@/components/forms/Button/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import * as React from "react";

export type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  className?: string;
};

export const ButtonLink: React.FC<ButtonLinkProps> = ({
  href,
  children,
  variant = "link",
  size = "default",
  className,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      asChild
      className={cn(
        "w-full border border-border text-foreground hover:bg-accent hover:text-accent-foreground font-bold shadow-xs hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-2",
        className
      )}
      {...props}
    >
      <Link href={href}>
        {children}
      </Link>
    </Button>
  );
};
