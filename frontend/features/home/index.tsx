"use client";

import { ButtonLink } from "@/components/forms/Button";
import { PageContainer, PageHeader } from "@/components/Layout";
import { HomeSkeleton } from "@/features/home/components/HomeSkeleton";
import { MetricCard } from "@/features/home/components/MetricCard";
import { TodayTodoCard } from "@/features/home/components/TodayTodoCard";
import { useHome } from "@/features/home/hooks/useHome";
import { getTodayDisplayString } from "@/features/home/utils";
import { Check, Plus } from "lucide-react";
import { FC } from "react";

type ContentProps = {
  messages: Record<string, string>;
};

export const Content: FC<ContentProps> = ({ messages }) => {
  const {
    userName,
    isDataLoading,
    totalTodosCount,
    completedTodosCount,
    todayIncompleteTodos,
  } = useHome();

  if (isDataLoading) {
    return <HomeSkeleton />;
  }

  return (
    <PageContainer>
      {/* タイトルと挨拶 */}
      <PageHeader
        title={messages["home.heading"]}
        description={messages["home.description"]?.replace("{username}", userName) + "。"}
      />

      {/* 統計情報カード */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard
          title={messages["home.total-todos"]}
          value={totalTodosCount}
          unit={messages["common.unit"]}
        />
        <MetricCard
          title={messages["home.completed-todos"]}
          value={completedTodosCount}
          unit={messages["common.unit"]}
        />
      </div>

      {/* 新規作成のショートカット */}
      <ButtonLink href="/todo/edit?mode=private&isNew=true">
        <Plus className="w-5 h-5" />
        {messages["home.create-todo"]}
      </ButtonLink>

      {/* 未完了TODOセクション */}
      <div>
        <div className="flex justify-between items-center mt-8 mb-4">
          <h2 className="text-md font-bold text-foreground">
            {messages["home.today-incomplete-todos"]?.replace("{date}", getTodayDisplayString())}
          </h2>
          <div className="bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full text-xs font-bold border border-border/40">
            {todayIncompleteTodos.length}
            {messages["common.unit"]}
          </div>
        </div>

        {todayIncompleteTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <div className="flex items-center justify-center w-16 h-16 rounded-full border-2 border-muted-foreground/30 text-muted-foreground/40 mb-3 bg-muted/10">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <p className="text-sm font-medium text-muted-foreground/85">
              {messages["home.today-incomplete-todos.empty"]}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayIncompleteTodos.map((todo) => (
              <TodayTodoCard key={todo.id} todo={todo} messages={messages} />
            ))}

            {/* リスト末尾のインジケーター */}
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-muted-foreground/20 text-muted-foreground/30 bg-muted/5">
                <Check className="w-6 h-6 stroke-[2]" />
              </div>
              <p className="text-xs font-medium text-muted-foreground/75">
                {messages["home.today-incomplete-todos.last-label"]}
              </p>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
