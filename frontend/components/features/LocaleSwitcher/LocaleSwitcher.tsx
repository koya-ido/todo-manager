"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/forms/ToggleGroup";
import { setLocale } from "@/lib/server-actions";
import { useRouter } from "next/navigation";
import { FC } from "react";

interface LocaleSwitcherProps {
  currentLocale: string;
}

export const LocaleSwitcher: FC<LocaleSwitcherProps> = ({ currentLocale }) => {
  const router = useRouter();

  const handleLocaleChange = async (locale: string) => {
    if (!locale || locale === currentLocale) return;

    await setLocale(locale);
    router.refresh();
  };

  return (
    <ToggleGroup
      className="absolute top-4 right-4"
      type="single"
      value={currentLocale}
      onValueChange={handleLocaleChange}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="ja" aria-label="日本語">
        日本語
      </ToggleGroupItem>
      <ToggleGroupItem value="en" aria-label="English">
        English
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
