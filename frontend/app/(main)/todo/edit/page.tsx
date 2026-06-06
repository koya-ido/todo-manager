import { Content } from "@/features/todoEdit";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";
import { TodoMode } from "@/types/todo";

type PageProps = {
  searchParams: Promise<{
    mode?: string;
    isNew?: string;
    id?: string;
    teamId?: string;
  }>;
};

/**
 * TODO作成・編集ページ
 * @param mode private | team TODOのモード
 * @param isNew 新規作成フラグ
 * @returns TODO作成・編集画面
 */
export default async function TodoListPage({ searchParams }: PageProps) {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  const resolvedParams = await searchParams;
  const mode =
    resolvedParams.mode === "private" || resolvedParams.mode === "team"
      ? (resolvedParams.mode as TodoMode)
      : undefined;
  const isNew = resolvedParams.isNew === "true";
  const todoId = resolvedParams.id ? parseInt(resolvedParams.id, 10) : undefined;
  const teamId = resolvedParams.teamId ? parseInt(resolvedParams.teamId, 10) : undefined;

  return <Content mode={mode} isNew={isNew} todoId={todoId} teamId={teamId} messages={messages} />;
}