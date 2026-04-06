import { LocaleContextValue } from "@/components/features/LocaleProvider/types";
import { setLocale } from "@/lib/server-actions";
import { createContext, FC, ReactNode } from "react";

export const LocaleContext = createContext<LocaleContextValue>({
  locale: "ja",
  setLocale: (locale: string) => void locale,
});

export const LocaleProvider: FC<{
  locale: string;
  children: ReactNode;
}> = ({ locale, children }) => {
  const handleSetLocale = async (locale: string) => {
    await setLocale(locale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};
