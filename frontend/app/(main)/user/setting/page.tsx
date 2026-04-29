import { Content } from "@/features/userSetting/components/Content";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "設定",
};

export default async function UserSettingPage() {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  return <Content messages={messages} />;
}
