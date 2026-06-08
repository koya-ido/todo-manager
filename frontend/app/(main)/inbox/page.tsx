import { InboxContent } from "@/features/inbox";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";

export default async function InboxPage() {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  return <InboxContent messages={messages} />;
}

