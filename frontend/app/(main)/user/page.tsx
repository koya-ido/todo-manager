import { Content } from "@/features/user/components/Content";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ユーザ―情報",
};

export default async function UserPage() {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  return <Content messages={messages} />;
}
