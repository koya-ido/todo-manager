import { Content } from "@/features/teamDetail";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * チーム詳細ページ
 * @param id チームのID
 * @returns チーム詳細画面
 */
export default async function TodoListPage({ params }: PageProps) {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  const resolvedParams = await params;

  const id = resolvedParams.id;
  const teamId = id ? parseInt(id, 10) : undefined;

  if (teamId === undefined) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <p className="text-destructive font-semibold">無効なIDです</p>
      </div>
    );
  }

  return (
    <Content teamId={teamId} messages={messages} locale={locale} />
  );
}