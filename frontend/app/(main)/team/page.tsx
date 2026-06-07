import { TeamContent } from "@/features/team/components/TeamContent";
import { getLocaleFromCookie, getMessages, t } from "@/lib/server-i18n";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocaleFromCookie();
  const title = await t("breadcrumb.team-list", locale);
  return {
    title,
  };
}

export default async function TeamPage() {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  return <TeamContent messages={messages} locale={locale} />;
}
