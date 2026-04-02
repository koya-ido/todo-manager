import { promises as fs } from "fs";
import { cookies } from "next/headers";
import path from "path";

type LocaleMessages = Record<string, string>;
type Locale = "ja" | "en";

const DEFAULT_LOCALE: Locale = "ja";
const SUPPORTED_LOCALES: Locale[] = ["ja", "en"];

let cachedMessages: Record<string, LocaleMessages> = {};

async function loadMessages(locale: string): Promise<LocaleMessages> {
  if (cachedMessages[locale]) {
    return cachedMessages[locale];
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "locales",
      `${locale}.json`,
    );
    const content = await fs.readFile(filePath, "utf-8");
    const messages = JSON.parse(content);
    cachedMessages[locale] = messages;
    return messages;
  } catch {
    console.error(`Failed to load locale: ${locale}`);
    return {};
  }
}

export async function t(key: string, locale: string = "ja"): Promise<string> {
  const messages = await loadMessages(locale);
  return messages[key] || key;
}

export async function getLocaleFromCookie(): Promise<Locale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get("LOCALE")?.value;

  if (locale && SUPPORTED_LOCALES.includes(locale as Locale)) {
    return locale as Locale;
  }

  return DEFAULT_LOCALE;
}

export async function getMessages(locale?: string): Promise<LocaleMessages> {
  const targetLocale = locale || (await getLocaleFromCookie());
  return loadMessages(targetLocale);
}
