import { Content } from "@/features/todoDetail";
import { getLocaleFromCookie, getMessages } from "@/lib/server-i18n";
import { TodoMode } from "@/types/todo";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    mode?: string;
    teamId?: string;
  }>;
};

/**
 * TODO詳細ページ
 * @param mode private | team TODOのモード
 * @param id TODOのID
 * @param teamId チームのID
 * @returns TODO詳細画面
 */
export default async function TodoListPage({ params, searchParams }: PageProps) {
  const locale = await getLocaleFromCookie();
  const messages = await getMessages(locale);

  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const id = resolvedParams.id;
  const mode =
    resolvedSearchParams.mode === "private" || resolvedSearchParams.mode === "team"
      ? (resolvedSearchParams.mode as TodoMode)
      : undefined;
  const todoId = id ? parseInt(id, 10) : undefined;
  const teamId = resolvedSearchParams.teamId ? parseInt(resolvedSearchParams.teamId, 10) : undefined;

  if (todoId === undefined) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <p className="text-destructive font-semibold">無効なIDです</p>
      </div>
    );
  }

  return (
    <Content todoId={todoId} mode={mode} teamId={teamId} messages={messages} />
  );
}