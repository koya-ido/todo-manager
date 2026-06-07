import { ErrorContent } from "@/features/error/components/ErrorContent";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "エラー",
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

type ErrorPageProps = {
  searchParams: SearchParams;
};

export default async function ErrorPage({ searchParams }: ErrorPageProps) {
  const resolvedParams = await searchParams;
  const status = typeof resolvedParams.status === "string" ? resolvedParams.status : "500";
  const code = typeof resolvedParams.code === "string" ? resolvedParams.code : "XXX";

  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  return <ErrorContent messages={messages} status={status} code={code} />;
}
