import { Content } from "@/features/inbox";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";

export default async function InboxPage() {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  return <Content messages={messages} />;
}

