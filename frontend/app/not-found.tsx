import { NotFoundContent } from "@/features/error/components/NotFoundContent";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";

export default async function NotFoundPage() {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  return <NotFoundContent messages={messages} />;
}
