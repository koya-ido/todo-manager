"use client";

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
import { Badge } from "@/components/Layout/Badge";
import { Card } from "@/components/Layout/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/Layout/Dialog";
import { Heading } from "@/components/typography/Heading";
import { TodoEditProps } from "@/features/todoEdit/types";
import { cn } from "@/lib/utils";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { Check, Plus, TriangleAlert, X } from "lucide-react";
import { FC, useRef } from "react";
import { SortableTaskItem } from "./components/SortableTaskItem";
import { useTodoForm } from "./hooks/useTodoForm";

export const Content: FC<TodoEditProps> = ({ mode = "private", isNew = false, todoId, teamId, messages }) => {
  const tagTriggerRef = useRef<HTMLButtonElement | null>(null);

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
      <div className="w-full flex justify-center items-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="w-full pb-28 space-y-6">
      {/* Title Header */}
      <section className="space-y-1 py-2">
        <Heading level={1} className="text-2xl font-bold">
          {messages[`todo-edit.heading.${isNew ? "register" : "edit"}`]}
        </Heading>
        <p className="text-sm text-muted-foreground">
          {messages["todo-edit.description"]}
        </p>
      </section>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Basic Info Card */}
        <section className="space-y-3">
          <Heading level={2} className="text-lg font-bold">
            {messages["todo-edit.basic-info"]}
          </Heading>

          <Card className="p-4 rounded-xl border bg-card space-y-4">
            {/* TODO Name */}
            <InputField
              label={(messages["todo-edit.title"])}
              placeholder={messages["todo-edit.title"]}
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full font-sans"
              errorText={fieldErrors.name}
            />

            {/* Status & Priority */}
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

            {/* Assignee / Manager (Team Mode Only) */}
            {mode === "team" && (
              <SelectField
                label={messages["todo-edit.manager"] || "担当者"}
                placeholder={messages["todo-edit.select-manager"] || "担当者を選択してください"}
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
                errorText={fieldErrors.managerId}
              />
            )}

            {/* Start Date & Due Date */}
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
                errorText={fieldErrors.dueDate}
              />
            </div>
          </Card>
        </section>

        {/* Tags Section */}
        <section className="space-y-3">
          <div className="flex justify-between items-center relative">
            <Heading level={2} className="text-lg font-bold">
              {messages["todo-edit.tag"]}
            </Heading>

            {/* Combobox Tag Selector */}
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
                          {/* Custom checkbox visual on the left */}
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

                {/* Inline Add Tag Form */}
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
                {messages["todo-detail.no-tag"] || "タグはありません"}
              </p>
            ) : (
              selectedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="bg-[#D9D9D9] text-foreground flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="hover:text-destructive focus:outline-hidden"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </Badge>
              ))
            )}
          </div>
        </section>

        {/* Tasks Section */}
        <section className="space-y-3">
          <Heading level={2} className="text-lg font-bold">
            {messages["todo-edit.task"] || "タスク"}
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
                  errorTextTitle={fieldErrors.tasks?.[task.key]?.title}
                  errorTextContent={fieldErrors.tasks?.[task.key]?.content}
                />
              ))}
            </div>
          </DragDropProvider>

          {/* Add Task Button */}
          <div className="flex justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTask}
              className="bg-background shadow-xs gap-1 px-4 py-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              {messages["todo-edit.task-item.add"] || "タスクを追加"}
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
            messages["todo-edit.update"]
          )}
        </Button>
      </form>

      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center justify-center gap-2">
              <TriangleAlert size={24} color="var(--destructive)" />
              {messages["todo-edit.confirm-discard.title"] || "変更内容を破棄しますか？"}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center py-2">
            {messages["todo-edit.confirm-discard.description"] || "編集中に画面遷移をしようとしたら、編集内容は破棄されます。本当に移動しますか？"}
          </DialogDescription>
          <DialogFooter>
            <div className="w-full flex flex-col gap-2">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleConfirmDiscard}
              >
                {messages["todo-edit.confirm-discard.confirm"] || "破棄して移動する"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancelDiscard}
              >
                {messages["todo-edit.confirm-discard.cancel"] || "編集を続ける"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
