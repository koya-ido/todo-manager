import { Content } from "@/features/login";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ログイン",
};

export default async function LoginPage() {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  return <Content messages={messages} />;
}
