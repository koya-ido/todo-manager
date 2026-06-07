import { Content } from "@/features/todos";
import { TodoMode } from "@/types/todo";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";

type PageProps = {
  searchParams: Promise<{
    mode?: string;
    isDeleteOnly?: string;
    teamId?: string;
  }>;
};

/**
 * TODO一覧ページ
 * @param mode private | team TODOのモード
 * @param isDeleteOnly true | false 削除一覧フラグ
 * @returns TODO一覧
 */
export default async function TodoListPage({ searchParams }: PageProps) {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  const resolvedParams = await searchParams;
  const mode =
    resolvedParams.mode === "private" || resolvedParams.mode === "team"
      ? (resolvedParams.mode as TodoMode)
      : undefined;
  const isDeleteOnly = resolvedParams.isDeleteOnly === "true";
  const teamId = resolvedParams.teamId ? parseInt(resolvedParams.teamId, 10) : undefined;

  return <Content mode={mode} isDeleteOnly={isDeleteOnly} teamId={teamId} messages={messages} />;
}