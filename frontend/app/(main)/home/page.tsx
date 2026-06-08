import { HomeContent } from "@/features/home";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";

export default async function HomePage() {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  return <HomeContent messages={messages} />;
}
