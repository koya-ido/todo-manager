import { LocaleContext } from "@/components/features/LocaleProvider/LocaleProvider";
import { setLocale } from "@/lib/server-actions";
import { useRouter } from "next/navigation";
import { useContext } from "react";

export const useLocaleSetting = () => {
  const router = useRouter();
  const { locale } = useContext(LocaleContext);

  const handleLocaleChange = async (newLocale: string) => {
    if (!newLocale || newLocale === locale) return;

    await setLocale(newLocale);
    router.refresh();
  };

  return { locale, handleLocaleChange };
};
