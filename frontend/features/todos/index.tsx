"use client";

import { Button } from "@/components/forms/Button";
import { ComboboxField } from "@/components/forms/FieldWrapper/components/ComboboxField";
import { InputGroupField } from "@/components/forms/FieldWrapper/components/InputGroupField";
import { SelectField } from "@/components/forms/FieldWrapper/components/SelectField";
import { IconTodo } from "@/components/icons/IconTodo";
import { Badge } from "@/components/Layout/Badge";
import { Card } from "@/components/Layout/Card";
import { Heading } from "@/components/typography/Heading";
import { TodoItemCard } from "@/features/todos/components/TodoItemCard";
import { TodoSkeletonList } from "@/features/todos/components/TodoSkeletonList";
import { useTodoFilter } from "@/features/todos/hooks/useTodoFilter";
import { TodoSort, useTodos } from "@/features/todos/hooks/useTodos";
import { TodosProps } from "@/features/todos/types";
import { ArrowUp, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FC, useEffect, useRef, useState } from "react";


export const Content: FC<TodosProps> = ({ mode = "private", isDeleteOnly = false, messages }) => {
  const router = useRouter();
  const [showScrollButton, setShowScrollButton] = useState(false);

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
    isDeleteOnly,
    appliedKeyword,
    appliedStatus,
    appliedPriority,
    appliedSort,
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

  const handleClickTodo = (todoId: number): void => router.push(`/todo/${todoId}`);

  const activeStatuses = status.filter(Boolean);
  const activePriorities = priority.filter(Boolean);

  return (
    <div className="w-full space-y-6">
      <Heading level={1}>{messages["todo-list.heading"]}</Heading>
      <Heading level={2}>{messages["todo-list.description"]}</Heading>
      <Card>
        <form className="w-full flex flex-col gap-4" onSubmit={handleClickSearch}>
          <div className="flex gap-3 items-end">
            <InputGroupField
              label={messages["todo-list.search"]}
              placeholder="Search..."
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              leftItem={<Search className="color-sidebar-ring" />}
            />
            <Button type="submit">{messages["todo-list.search-button"]}</Button>
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
        <Button
          variant="secondary"
          asChild
          className="w-full bg-background text-foreground"
        >
          <Link href={`/todo/edit?mode=${mode}&isNew=true`}>
            <Plus />
            {messages["todo-list.create-todo"]}
          </Link>
        </Button>
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
        className={`fixed bottom-20 right-6 z-50 rounded-full shadow-lg transition-all duration-300 ease-in-out ${showScrollButton
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-75 pointer-events-none"
          }`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5" />
      </Button>
    </div>
  );
};
