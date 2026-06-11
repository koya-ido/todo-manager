"use client";

import { ErrorContext } from "@/components/features/ErrorProvider";
import { Button } from "@/components/forms/Button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@/components/forms/Combobox";
import { DateField } from "@/components/forms/FieldWrapper/components/DateField";
import { InputField } from "@/components/forms/FieldWrapper/components/InputField";
import { SelectField } from "@/components/forms/FieldWrapper/components/SelectField";
import { PageContainer, PageHeader } from "@/components/Layout";
import { TagBadge } from "@/components/Layout/Badge";
import { Card } from "@/components/Layout/Card";
import {
  ConfirmDialog
} from "@/components/Layout/Dialog";
import { Skeleton } from "@/components/Layout/Skeleton";
import { Heading } from "@/components/typography/Heading";
import { SortableTaskItem } from "@/features/todoEdit/components/SortableTaskItem";
import { useTodoForm } from "@/features/todoEdit/hooks/useTodoForm";
import { TodoEditProps } from "@/features/todoEdit/types";
import { cn } from "@/lib/utils";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { Check, Plus, TriangleAlert } from "lucide-react";
import { FC, useContext, useRef } from "react";

export const Content: FC<TodoEditProps> = ({ mode = "private", isNew = false, todoId, teamId, messages }) => {
  const tagTriggerRef = useRef<HTMLButtonElement | null>(null);
  const { getInlineError } = useContext(ErrorContext);

  const {
    name,
    statusId,
    setStatusId,
    priorityId,
    setPriorityId,
    startDate,
    dueDate,
    managerId,
    setManagerId,
    selectedTags,
    setSelectedTags,
    tasks,
    setTasks,
    members,
    availableTags,
    newTagName,
    setNewTagName,
    isCreatingTag,
    isLoading,
    showDiscardDialog,
    setShowDiscardDialog,
    fieldErrors,
    setFieldErrors,
    handleNameChange,
    handleStartDateChange,
    handleDueDateChange,
    handleCreateTag,
    handleRemoveTag,
    handleAddTask,
    handleRemoveTask,
    handleTaskChange,
    handleSubmit,
    isSubmitDisabled,
    handleConfirmDiscard,
    handleCancelDiscard,
  } = useTodoForm({
    mode,
    isNew,
    todoId,
    teamId,
    messages,
  });

  const statusItems = [
    { value: "1", label: messages["common.status.not-started"] },
    { value: "2", label: messages["common.status.in-progress"] },
    { value: "3", label: messages["common.status.done"] },
    { value: "4", label: messages["common.status.pending"] },
  ];

  const priorityItems = [
    { value: "1", label: messages["common.priority.high"] },
    { value: "2", label: messages["common.priority.medium"] },
    { value: "3", label: messages["common.priority.low"] },
  ];

  if (isLoading) {
    return (
      <div className="w-full pb-28 space-y-6 animate-pulse">
        {/* タイトルヘッダーのスケルトン */}
        <section className="space-y-2 py-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </section>

        {/* 基本情報カードのスケルトン */}
        <section className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <Card className="p-4 rounded-xl border bg-card space-y-4">
            {/* TODO名フィールド */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* ステータスと優先度フィールド */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* 担当者 (teamモードのみ表示) */}
            {mode === "team" && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}

            {/* 開始日と期限日フィールド */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </Card>
        </section>

        {/* タグセクションのスケルトン */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
          <div className="flex flex-wrap gap-2 min-h-8 items-center">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </section>

        {/* タスクセクションのスケルトン */}
        <section className="space-y-3">
          <Skeleton className="h-6 w-16" />
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2 bg-card border rounded-xl p-4 shadow-xs">
                <Skeleton className="h-5 w-5 rounded-md shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-2">
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </section>

        {/* 送信ボタンのスケルトン */}
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    );
  }

  return (
    <PageContainer className="max-w-3xl mx-auto">
      {/* タイトルヘッダー */}
      <PageHeader
        title={isNew ? messages["todo-edit.heading.register"] : messages["common.edit"]}
        description={messages["todo-edit.description"]}
      />

      {/* メインフォーム */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* 基本情報カード */}
        <section className="space-y-3">
          <Heading level={2} className="text-lg font-bold">
            {messages["todo-edit.basic-info"]}
          </Heading>

          <Card className="p-4 rounded-xl border bg-card space-y-4">
            {/* TODO名 */}
            <InputField
              label={(messages["todo-edit.title"])}
              placeholder={messages["todo-edit.title"]}
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full font-sans"
              errorText={fieldErrors.name || getInlineError("/name") || undefined}
            />

            {/* ステータスと優先度 */}
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label={messages["common.status"]}
                items={statusItems}
                value={statusId}
                onValueChange={setStatusId}
              />
              <SelectField
                label={messages["common.priority"]}
                items={priorityItems}
                value={priorityId}
                onValueChange={setPriorityId}
              />
            </div>

            {/* 担当者 / 管理者（チームモードのみ） */}
            {mode === "team" && (
              <SelectField
                label={messages["todo-edit.manager"]}
                placeholder={messages["todo-edit.select-manager"]}
                items={members.map((m) => ({ value: String(m.id), label: `${m.user_name} (${m.display_user_id})` }))}
                value={managerId}
                onValueChange={(val) => {
                  setManagerId(val);
                  setFieldErrors((prev) => {
                    const nextErrors = { ...prev };
                    delete nextErrors.managerId;
                    return nextErrors;
                  });
                }}
                required
                errorText={fieldErrors.managerId || getInlineError("/manager_id") || undefined}
              />
            )}

            {/* 開始日と期限日 */}
            <div className="grid grid-cols-2 gap-4">
              <DateField
                label={messages["common.start-date"]}
                placeholder={messages["common.start-date"]}
                value={startDate}
                onChange={handleStartDateChange}
              />
              <DateField
                label={messages["common.due-date"]}
                placeholder={messages["common.due-date"]}
                value={dueDate}
                onChange={handleDueDateChange}
                errorText={fieldErrors.dueDate || getInlineError("/due_date") || undefined}
              />
            </div>
          </Card>
        </section>

        {/* タグセクション */}
        <section className="space-y-3">
          <div className="flex justify-between items-center relative">
            <Heading level={2} className="text-lg font-bold">
              {messages["common.tag"]}
            </Heading>

            {/* コンボボックス・タグセレクター */}
            <Combobox
              multiple
              value={selectedTags.map((t) => String(t.id))}
              onValueChange={(val) => {
                const ids = (val as string[]).map(Number);
                const nextSelected = availableTags.filter((t) => ids.includes(t.id));
                setSelectedTags(nextSelected);
              }}
            >
              <ComboboxTrigger
                ref={tagTriggerRef}
                type="button"
                className="bg-card px-3 py-2 rounded-md flex items-center gap-1 text-sm font-semibold text-foreground hover:opacity-85 focus:outline-hidden"
              >
                {messages["todo-edit.add-tag"]}
              </ComboboxTrigger>
              <ComboboxContent anchor={tagTriggerRef} className="w-56 p-1">
                {availableTags.length === 0 ? (
                  <ComboboxEmpty className="p-2 text-xs text-muted-foreground text-center">
                    {messages["todo-detail.no-tag"]}
                  </ComboboxEmpty>
                ) : (
                  <ComboboxList className="space-y-0.5">
                    {availableTags.map((tag) => {
                      const isSelected = selectedTags.some((t) => t.id === tag.id);
                      return (
                        <ComboboxItem
                          key={tag.id}
                          value={String(tag.id)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer select-none [&_[data-slot=combobox-item-indicator]]:hidden"
                        >
                          {/* 左側のカスタムチェックボックスのビジュアル */}
                          <div className={cn(
                            "h-4 w-4 rounded-sm border border-input flex items-center justify-center transition-colors pointer-events-none",
                            isSelected ? "bg-foreground border-foreground text-background" : "bg-transparent"
                          )}>
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="text-foreground">{tag.name}</span>
                        </ComboboxItem>
                      );
                    })}
                  </ComboboxList>)}

                {/* インライン・タグ追加フォーム */}
                <ComboboxSeparator className="my-1 border-t" />
                <div className="p-1 flex gap-1 items-center">
                  <input
                    type="text"
                    placeholder={messages["user-setting.tag.placeholder"]}
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-0 border rounded-md px-2 py-1 text-xs outline-none bg-background text-foreground focus:border-foreground"
                  />
                  <Button
                    type="button"
                    disabled={isCreatingTag || !newTagName}
                    onClick={handleCreateTag}
                    size="xs"
                    className="text-xs h-7 px-2"
                  >
                    {messages["user-setting.tag.add"]}
                  </Button>
                </div>
              </ComboboxContent>
            </Combobox>
          </div>

          <div className="flex flex-wrap gap-2 min-h-8 items-center">
            {selectedTags.length === 0 ? (
              <p className="text-sm text-muted-foreground/70">
                {messages["todo-detail.no-tag"]}
              </p>
            ) : (
              selectedTags.map((tag) => (
                <TagBadge
                  key={tag.id}
                  name={tag.name}
                  onRemove={() => handleRemoveTag(tag.id)}
                />
              ))
            )}
          </div>
        </section>

        {/* タスクセクション */}
        <section className="space-y-3">
          <Heading level={2} className="text-lg font-bold">
            {messages["common.task"]}
          </Heading>

          <DragDropProvider
            onDragEnd={(event) => {
              const { source } = event.operation;
              if (source && isSortable(source)) {
                const from = source.sortable.initialIndex;
                const to = source.sortable.index;
                if (from !== to) {
                  setTasks((prev) => {
                    const updatedTasks = [...prev];
                    const [removed] = updatedTasks.splice(from, 1);
                    updatedTasks.splice(to, 0, removed);
                    return updatedTasks;
                  });
                }
              }
            }}
          >
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <SortableTaskItem
                  key={task.key}
                  task={task}
                  index={index}
                  tasksCount={tasks.length}
                  handleTaskChange={handleTaskChange}
                  handleRemoveTask={handleRemoveTask}
                  messages={messages}
                  errorTextTitle={fieldErrors.tasks?.[task.key]?.title || getInlineError(`/tasks/${index}/title`) || undefined}
                  errorTextContent={fieldErrors.tasks?.[task.key]?.content || getInlineError(`/tasks/${index}/content`) || undefined}
                />
              ))}
            </div>
          </DragDropProvider>

          {/* タスク追加ボタン */}
          <div className="flex justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTask}
              className="bg-background shadow-xs gap-1 px-4 py-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              {messages["todo-edit.task-item.add"]}
            </Button>
          </div>
        </section>

        <Button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full bg-foreground text-background hover:bg-foreground/90 font-bold py-3 px-6 shadow-md flex items-center justify-center gap-2"
        >
          {isNew ? (
            <>
              <Plus className="h-5 w-5" />
              {messages["common.register"]}
            </>
          ) : (
            messages["common.update"]
          )}
        </Button>
      </form>

      <ConfirmDialog
        isOpen={showDiscardDialog}
        onOpenChange={setShowDiscardDialog}
        title={
          <>
            <TriangleAlert size={24} className="text-destructive" />
            {messages["todo-edit.confirm-discard.title"]}
          </>
        }
        description={messages["todo-edit.confirm-discard.description"]}
        confirmText={messages["todo-edit.confirm-discard.confirm"]}
        cancelText={messages["todo-edit.confirm-discard.cancel"]}
        buttonLayout="vertical"
        onConfirm={handleConfirmDiscard}
        onCancel={handleCancelDiscard}
      />
    </PageContainer>
  );
};
