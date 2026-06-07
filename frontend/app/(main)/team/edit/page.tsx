import { Content } from "@/features/teamEdit";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";

type PageProps = {
  searchParams: Promise<{
    isNew?: string;
    id?: string;
  }>;
};

/**
 * チーム登録・編集ページ
 * @param isNew 新規作成フラグ (true | false)
 * @param id チームID (編集時のみ)
 * @returns チーム登録・編集画面
 */
export default async function TeamEditPage({ searchParams }: PageProps) {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  const resolvedParams = await searchParams;
  const isNew = resolvedParams.isNew === "true";
  const teamId = resolvedParams.id ? parseInt(resolvedParams.id, 10) : undefined;

  return <Content isNew={isNew} teamId={teamId} messages={messages} />;
}
