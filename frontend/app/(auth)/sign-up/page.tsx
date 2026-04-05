import { Content } from "@/features/signUp/components/Content";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "サインアップ",
};

export default async function SignUpPage() {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  return <Content messages={messages} />;
}
