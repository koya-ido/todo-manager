"use client";

import { Button, ButtonLink } from "@/components/forms/Button";
import { ComboboxField } from "@/components/forms/FieldWrapper/components/ComboboxField";
import { InputGroupField } from "@/components/forms/FieldWrapper/components/InputGroupField";
import { SelectField } from "@/components/forms/FieldWrapper/components/SelectField";
import { Switch } from "@/components/forms/Switch";
import { IconTodo } from "@/components/icons/IconTodo";
import { PageContainer, PageHeader } from "@/components/Layout";
import { Badge } from "@/components/Layout/Badge";
import { Card } from "@/components/Layout/Card";
import { TodoItemCard } from "@/features/todos/components/TodoItemCard";
import { TodoSkeletonList } from "@/features/todos/components/TodoSkeletonList";
import { useTodoFilter } from "@/features/todos/hooks/useTodoFilter";
import { TodoSort, useTodos } from "@/features/todos/hooks/useTodos";
import { TodosProps } from "@/features/todos/types";
import { apiGet } from "@/hooks/useFetchApi";
import { User } from "@/types/user";
import { ArrowUp, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useEffect, useRef, useState } from "react";


export const Content: FC<TodosProps> = ({ mode = "private", isDeleteOnly = false, teamId, messages }) => {
  const router = useRouter();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const [teamName, setTeamName] = useState<string>("");
  const [deleteOnly, setDeleteOnly] = useState(isDeleteOnly);

  useEffect(() => {
    setDeleteOnly(isDeleteOnly);
  }, [isDeleteOnly]);

  const handleToggleDeleteOnly = (checked: boolean) => {
    setDeleteOnly(checked);
    const params = new URLSearchParams(window.location.search);
    if (checked) {
      params.set("isDeleteOnly", "true");
    } else {
      params.delete("isDeleteOnly");
    }
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (mode !== "team") return;
    const fetchMembers = async () => {
      try {
        const url = teamId ? `/user/team/${teamId}/members` : "/user/teams/members";
        const data = await apiGet<User[]>(url);
        setMembers(data);
      } catch (error) {
        console.error(error);
      }
    };
    void fetchMembers();
  }, [mode, teamId]);

  useEffect(() => {
    if (mode !== "team" || !teamId) return;
    const fetchTeamDetail = async () => {
      try {
        const team = await apiGet<{ name: string }>(`/team/${teamId}`);
        setTeamName(team.name);
      } catch (error) {
        console.error(error);
      }
    };
    void fetchTeamDetail();
  }, [mode, teamId]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const {
    keyword,
    setKeyword,
    status,
    priority,
    sort,
    setSort,
    managerId,
    setManagerId,
    StatusFilterItems,
    PriorityFilterItems,
    SortItems,
    handleStatusChange,
    handlePriorityChange,
    handleClickSearch,
    appliedKeyword,
    appliedStatus,
    appliedPriority,
    appliedSort,
    appliedManagerId,
  } = useTodoFilter(messages);

  const {
    filteredTodos,
    filteredCount,
    isLoading,
    isLoadingMore,
    hasMore,
    totalTodos,
    loadMore,
  } = useTodos(
    mode,
    deleteOnly,
    appliedKeyword,
    appliedStatus,
    appliedPriority,
    appliedSort,
    appliedManagerId,
    teamId,
  );

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [loadMore, hasMore]);

  const handleClickTodo = (todoId: number): void => {
    if (mode === "team" && teamId) {
      router.push(`/todo/${todoId}?mode=team&teamId=${teamId}`);
    } else {
      router.push(`/todo/${todoId}?mode=${mode}`);
    }
  };

  const activeStatuses = status.filter(Boolean);
  const activePriorities = priority.filter(Boolean);

  return (
    <PageContainer className="max-w-5xl mx-auto">
      <PageHeader
        title={
          mode === "team" && teamName
            ? `${teamName} ${messages["todo-list.heading"]}`
            : messages["todo-list.heading"]}
        description={messages["todo-list.description"]}
      />
      <Card>
        <form className="w-full flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-4 md:items-end" onSubmit={handleClickSearch}>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-900/50">
            <label
              htmlFor="delete-only-toggle"
              className="text-sm font-semibold select-none cursor-pointer text-slate-700 dark:text-slate-300"
            >
              {messages["todo-list.show-deleted-only"]}
            </label>
            <Switch
              id="delete-only-toggle"
              checked={deleteOnly}
              onCheckedChange={handleToggleDeleteOnly}
            />
          </div>
          <div className="flex gap-3 items-end">
            <InputGroupField
              label={messages["todo-list.search"]}
              placeholder="Search..."
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              leftItem={<Search className="color-sidebar-ring" />}
            />
            <Button type="submit">{messages["common.search"]}</Button>
          </div>
          <ComboboxField
            multiple
            label={messages["common.status"]}
            items={StatusFilterItems.map((item) => item.label)}
            value={status}
            onValueChange={handleStatusChange}
            placeholder="Select a status..."
          />
          <ComboboxField
            multiple
            label={messages["common.priority"]}
            items={PriorityFilterItems.map((item) => item.label)}
            value={priority}
            onValueChange={handlePriorityChange}
            placeholder="Select a priority..."
          />
          {mode === "team" && (
            <SelectField
              label={messages["todo-edit.manager"]}
              items={[
                { value: "0", label: messages["todo-list.filter-option.manager.all"] },
                ...members.map((m) => ({ value: String(m.id), label: `${m.user_name} #${m.display_user_id}` }))
              ]}
              value={managerId}
              onValueChange={setManagerId}
            />
          )}
          <SelectField
            label={messages["todo-list.sort-label"]}
            items={SortItems}
            value={sort}
            defaultValue="create-date-desc"
            onValueChange={(v) => setSort(v as TodoSort)} />
        </form>
      </Card>
      <section className="space-y-2">
        {activeStatuses.length > 0 && (
          <div className="flex gap-2">
            {activeStatuses.map((item) => (
              <Badge key={item} className="bg-sidebar-ring ">
                <p className="text-foreground font-bold text-xs">{item}</p>
              </Badge>
            ))}
          </div>
        )}
        {activePriorities.length > 0 && (
          <div className="flex gap-2">
            {activePriorities.map((item) => (
              <Badge
                key={item}
                className="bg-sidebar-ring text-foreground font-bold text-xs"
              >
                {item}
              </Badge>
            ))}
          </div>
        )}
      </section>
      <section className="space-y-4">
        <div className="w-full flex gap-10">
          <div>
            <p>{messages["todo-list.all-todos"]}</p>
            <p className="text-3xl">{totalTodos.length}</p>
          </div>
          <div>
            <p>{messages["todo-list.filtered-todos"]}</p>
            <p className="text-3xl">{filteredCount}</p>
          </div>
        </div>
        <ButtonLink
          variant="secondary"
          href={`/todo/edit?mode=${mode}&isNew=true`}
        >
          <Plus />
          {messages["todo-list.create-todo"]}
        </ButtonLink>
      </section>
      <section className="space-y-2">
        {isLoading ? (
          <TodoSkeletonList />
        ) : filteredTodos.length === 0 ? (
          <div className="w-full flex flex-col justify-center items-center gap-3">
            <IconTodo />
            <p className="text-sidebar-ring">
              {
                messages[
                totalTodos.length === 0
                  ? "todo-list.unregistered"
                  : "todo-list.no-match"
                ]
              }
            </p>
          </div>
        ) : (
          <>
            {filteredTodos.map((todo) => (
              <TodoItemCard
                key={todo.id}
                todo={todo}
                messages={messages}
                onClick={() => handleClickTodo(todo.id)}
                mode={mode}
              />
            ))}
            {isLoadingMore && <TodoSkeletonList />}
            {hasMore ? (
              <div ref={sentinelRef} className="h-10 w-full" />
            ) : (
              <div className="w-full flex flex-col justify-center items-center gap-3 py-4">
                <IconTodo />
                <p className="text-sidebar-ring">
                  {messages["todo-list.last-label"]}
                </p>
              </div>
            )}
          </>
        )}
      </section>
      <Button
        id="scroll-to-top-button"
        onClick={scrollToTop}
        variant="default"
        size="icon"
        className={`fixed bottom-20 md:bottom-6 right-6 z-50 rounded-full shadow-lg transition-all duration-300 ease-in-out ${showScrollButton
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-75 pointer-events-none"
          }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </PageContainer>
  );
};
