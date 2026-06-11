"use client";

import { Button, ButtonLink } from "@/components/forms/Button";
import { Checkbox } from "@/components/forms/Checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/forms/ToggleGroup";
import { PageContainer, PageHeader } from "@/components/Layout";
import { PriorityBadge, StatusBadge, TagBadge } from "@/components/Layout/Badge";
import { Card } from "@/components/Layout/Card";
import {
  ConfirmDialog
} from "@/components/Layout/Dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Layout/Popover";
import { Separator } from "@/components/Layout/Separator";
import { Skeleton } from "@/components/Layout/Skeleton";
import { Heading } from "@/components/typography/Heading";
import { useTodoDetail } from "@/features/todoDetail/hooks/useTodoDetail";
import { TodoDetailProps } from "@/features/todoDetail/types";
import { cn } from "@/lib/utils";
import { Priority, Status } from "@/types/todo";
import { AlertCircle, MessageSquare, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { FC, useState } from "react";



export const Content: FC<TodoDetailProps> = ({ todoId, mode = "private", messages }) => {
  const {
    todo,
    currentUser,
    isLoading,
    commentText,
    setCommentText,
    isSubmittingComment,
    isUpdatingCommentId,
    handleUpdateStatus,
    handleToggleTask,
    handleSendComment,
    handleDeleteComment,
    handleDeleteTodo,
    handleRestoreTodo,
    handleUpdateComment,
  } = useTodoDetail({ todoId, messages });

  const statusItems = [
    { value: "1", label: messages["common.status.not-started"], statusKey: "not-started" },
    { value: "2", label: messages["common.status.in-progress"], statusKey: "in-progress" },
    { value: "3", label: messages["common.status.done"], statusKey: "done" },
    { value: "4", label: messages["common.status.pending"], statusKey: "pending" },
  ];

  // コメント削除ダイアログの状態
  const [commentToDeleteId, setCommentToDeleteId] = useState<number | null>(null);

  // Todo削除の状態
  const [isDeleteTodoDialogOpen, setIsDeleteTodoDialogOpen] = useState<boolean>(false);
  const [isDeletingTodo, setIsDeletingTodo] = useState<boolean>(false);

  // コメント編集の状態
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState<string>("");

  const handleStartEditComment = (commentId: number, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
  };

  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const handleSaveCommentEdit = async (commentId: number) => {
    try {
      await handleUpdateComment(commentId, editingCommentText);
      setEditingCommentId(null);
      setEditingCommentText("");
    } catch {
      // エラーはフック内で処理される
    }
  };


  if (isLoading) {
    return (
      <div className="w-full pb-20 space-y-6 animate-pulse">
        {/* タイトルヘッダーのスケルトン */}
        <section className="space-y-2 py-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </section>

        {/* メインTODO詳細カードのスケルトン */}
        <Card className="p-5 rounded-2xl border bg-card shadow-xs space-y-4">
          {/* バッジのスケルトン */}
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
          </div>

          {/* タイトルのスケルトン */}
          <Skeleton className="h-7 w-3/4" />

          {/* 担当者のスケルトン */}
          {mode === "team" && (
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-5 w-32" />
            </div>
          )}

          {/* 日付情報のスケルトン */}
          <div className="grid grid-cols-2 gap-4 text-sm pt-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>

          {/* 進捗バーのスケルトン */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3.5 w-8" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>

          {/* ステータス切り替えコントロールのスケルトン */}
          <Skeleton className="h-10 w-full rounded-lg" />
        </Card>

        {/* 編集および削除アクションのスケルトン */}
        <div className="flex gap-3">
          <Skeleton className="h-11 flex-1 rounded-md" />
          <Skeleton className="h-11 flex-1 rounded-md" />
        </div>

        {/* タグセクションのスケルトン */}
        <section className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        </section>

        {/* タスクセクションのスケルトン */}
        <section className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="space-y-2.5">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-card">
                <Skeleton className="size-5 rounded-md shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3.5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* コメントセクションのスケルトン */}
        <section className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          {/* 新規コメント入力フォームのスケルトン */}
          <div className="space-y-2">
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="flex justify-end">
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>
          {/* コメント項目リストのスケルトン */}
          <div className="space-y-3 pt-2">
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 bg-card space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (!todo) return null;

  // 日付のフォーマット
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "yyyy/MM/dd";
    const d = new Date(dateStr);
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const pad = (num: number) => String(num).padStart(2, "0");
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // 進捗の計算
  const totalTasksCount = todo.tasks.length;
  const completedTasksCount = todo.tasks.filter((t) => t.completion_flag).length;
  const progress = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // 期限超過のチェック
  const isOverdue =
    todo.due_date &&
    new Date(todo.due_date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0) &&
    todo.status_id !== 3; // 「完了」以外

  const todoStatusKey = Status[todo.status_id as keyof typeof Status] || "not-started";
  const todoPriorityKey = Priority[todo.priority_id as keyof typeof Priority] || "medium";

  return (
    <PageContainer className="max-w-3xl mx-auto">
      {/* タイトルヘッダー */}
      <PageHeader
        title={messages["todo-detail.heading"]}
        description={messages["todo-detail.description"]}
      />

      {/* メインTODO詳細カード */}
      <Card className="p-5 rounded-2xl border bg-card shadow-xs">
        {/* バッジ */}
        <div className="flex gap-2">
          <StatusBadge status={todoStatusKey} messages={messages} />
          <PriorityBadge priority={todoPriorityKey} messages={messages} />
        </div>

        {/* タイトル */}
        <h2 className="text-xl font-bold text-foreground break-words">{todo.name}</h2>

        {mode === "team" && (
          <div>
            <p className="text-xs text-muted-foreground font-semibold mb-0.5">
              {messages["todo-edit.manager"]}
            </p>
            <div className="flex items-center" title={todo.manager ? `${todo.manager.user_name} #${todo.manager.display_user_id}` : undefined}>
              {todo.manager
                ? <p className="flex gap-2 font-bold items-center">{todo.manager.user_name}<span className="text-foreground/60 text-xs">#{todo.manager.display_user_id}</span></p>
                : (messages["todo-detail.unassigned"])}
            </div>
          </div>
        )}

        {/* 日付情報 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground font-semibold mb-0.5">
              {messages["common.start-date"]}
            </p>
            <p className="font-bold text-foreground">{formatDate(todo.created_at)}</p>
          </div>
          <div>
            <p className={cn("text-xs font-semibold mb-0.5", isOverdue ? "text-destructive" : "text-muted-foreground")}>
              {messages["common.due-date"]}
            </p>
            <div className="flex items-center gap-1.5">
              <p className={cn("font-bold", isOverdue ? "text-destructive" : "text-foreground")}>
                {formatDate(todo.due_date)}
              </p>
              {isOverdue && <AlertCircle className="h-4 w-4 text-destructive fill-destructive/10 shrink-0" />}
            </div>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-semibold">進捗状況</span>
            <span className="font-bold text-foreground">{progress}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-foreground dark:bg-gray-200 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ステータス切り替えコントロール */}
        <ToggleGroup
          type="single"
          value={String(todo.status_id)}
          onValueChange={(val) => {
            if (val) handleUpdateStatus(val);
          }}
          spacing={1}
          className="flex border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 p-1 w-full"
          disabled={todo.delete_flag}
        >
          {statusItems.map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className={cn(
                "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer focus:outline-hidden text-center justify-center h-auto hover:bg-transparent text-gray-500 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-100 bg-transparent shadow-none border-0",
                "data-[state=on]:bg-white dark:data-[state=on]:bg-gray-600 data-[state=on]:text-foreground data-[state=on]:font-bold data-[state=on]:shadow-xs data-[state=on]:border data-[state=on]:border-gray-200/50"
              )}
            >
              {messages[`common.status.${item.statusKey}`] || item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Card>

      {/* 編集および削除アクション */}
      {todo.delete_flag ? (
        <div className="flex gap-3">
          <Button
            variant="default"
            type="button"
            onClick={() => handleRestoreTodo(mode)}
            className="flex-1 bg-foreground text-background hover:bg-foreground/90 dark:hover:bg-foreground/60 font-bold py-3 shadow-xs flex items-center justify-center gap-2 text-sm cursor-pointer w-auto"
          >
            {messages["todo-detail.restore.button"]}
          </Button>
          <Button
            variant="destructive"
            type="button"
            onClick={() => setIsDeleteTodoDialogOpen(true)}
            className="flex-1 text-sm font-bold py-3 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            {messages["todo-detail.delete-permanently.button"]}
          </Button>
        </div>
      ) : (
        <div className="flex gap-3">
          <ButtonLink
            variant="secondary"
            href={`/todo/edit?mode=${mode}&id=${todoId}`}
            className="flex-1 bg-background border border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-foreground font-bold py-3 shadow-xs flex items-center justify-center gap-2 text-sm w-auto"
          >
            <Pencil className="h-4 w-4" />
            {messages["common.edit.verb"]}
          </ButtonLink>
          <Button
            variant="destructive"
            type="button"
            onClick={() => setIsDeleteTodoDialogOpen(true)}
            className="flex-1 text-sm font-bold py-3 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            {messages["common.delete.verb"]}
          </Button>
        </div>
      )}

      {/* タグセクション */}
      <section className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <Heading level={2} className="text-lg font-bold">
            {messages["common.tag"]}
          </Heading>
          <span className="text-sm text-muted-foreground font-medium">
            {todo.tags.length}
            {messages["common.unit"]}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {todo.tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {messages["todo-detail.no-tag"]}
            </p>
          ) : (
            todo.tags.map((tag) => (
              <TagBadge
                key={tag.id}
                name={tag.name}
              />
            ))
          )}
        </div>
      </section>

      {/* タスクセクション */}
      <section className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <Heading level={2} className="text-lg font-bold">
            {messages["common.task"]}
          </Heading>
          <span className="text-sm text-muted-foreground font-medium">
            {todo.tasks.length}
            {messages["common.unit"]}
          </span>
        </div>
        <div className="space-y-2.5">
          {todo.tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">タスクはありません</p>
          ) : (
            [...todo.tasks]
              .sort((a, b) => a.position - b.position)
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-card shadow-2xs"
                >
                  {/* カスタムチェックボックス */}
                  <Checkbox
                    checked={task.completion_flag}
                    onCheckedChange={(checked) => {
                      handleToggleTask(task.id, checked === true);
                    }}
                    disabled={todo.delete_flag}
                    className="mt-0.5 size-5 border-gray-300 data-[state=checked]:bg-foreground data-[state=checked]:border-foreground data-[state=checked]:text-background cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {/* タスク内容 */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className={cn("text-sm font-semibold break-words", task.completion_flag ? "text-muted-foreground line-through" : "text-foreground")}>
                      {task.title}
                    </p>
                    {task.content && (
                      <>
                        <Separator />
                        <p className={cn("text-xs whitespace-pre-wrap leading-relaxed break-words", task.completion_flag ? "text-muted-foreground/60" : "text-muted-foreground")}>
                          {task.content}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </section>

      {/* コメントセクション */}
      <section className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <Heading level={2} className="text-lg font-bold">
            {messages["todo-detail.comment"]}
          </Heading>
          <span className="text-sm text-muted-foreground font-medium">
            {todo.comments.filter(c => !c.delete_flag).length}
            {messages["common.unit"]}
          </span>
        </div>

        {/* 新規コメント入力フォーム */}
        {!todo.delete_flag && (
          <form onSubmit={handleSendComment} className="space-y-2">
            <textarea
              placeholder={messages["todo-detail.comment.placeholder"]}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={isSubmittingComment}
              maxLength={800}
              rows={3}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-hidden focus:border-foreground bg-white dark:bg-gray-700 text-foreground placeholder:text-muted-foreground/50 resize-none font-sans"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmittingComment || !commentText.trim()}
                className="bg-foreground text-background hover:bg-foreground/90 font-bold px-5 py-2 text-sm rounded-lg flex items-center justify-center gap-1.5"
              >
                {messages["todo-detail.comment.send"]}
              </Button>
            </div>
          </form>
        )}

        {/* コメント項目リスト */}
        <div className="space-y-3 pt-2">
          {todo.comments.filter(c => !c.delete_flag).length === 0 ? (
            <div className="w-full py-8 flex flex-col justify-center items-center gap-2 text-muted-foreground/60">
              <MessageSquare className="h-6 w-6 stroke-1" />
              <p className="text-xs">
                {messages["todo-detail.comment.no-comment"]}
              </p>
            </div>
          ) : (
            [...todo.comments]
              .filter((comment) => !comment.delete_flag)
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((comment) => {
                const commentUser = comment.user;
                const authorDisplay = commentUser ? commentUser.user_name : `user_${comment.user_id}`;
                const authorDisplayId = commentUser ? commentUser.display_user_id : undefined;
                const isAuthor =
                  currentUser && commentUser && currentUser.display_user_id === commentUser.display_user_id;
                const isEdited = new Date(comment.updated_at).getTime() > new Date(comment.created_at).getTime();

                return (
                  <div
                    key={comment.id}
                    className="p-4 rounded-xl border border-gray-100 bg-card space-y-1.5 shadow-2xs"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex gap-2">

                        <span className="font-bold text-foreground">{authorDisplay}</span>
                        <span className="font-bold text-foreground/50">#{authorDisplayId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5">
                          <span>{formatDateTime(comment.created_at)}</span>
                          {isEdited && (
                            <span className="text-[10px] bg-gray-100 text-muted-foreground/85 px-1.5 py-0.5 rounded-sm font-bold select-none">
                              {messages["todo-detail.comment.edited"]}
                            </span>
                          )}
                        </div>
                        {isAuthor && !todo.delete_flag && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                className="p-0 size-6 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer text-muted-foreground"
                                title="操作"
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-24 p-1 flex flex-col bg-white border border-gray-100 rounded-lg shadow-md">
                              <button
                                type="button"
                                onClick={() => handleStartEditComment(comment.id, comment.comment)}
                                className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 text-foreground flex items-center gap-2 rounded-md cursor-pointer"
                              >
                                <Pencil className="h-3 w-3" />
                                編集
                              </button>
                              <button
                                type="button"
                                onClick={() => setCommentToDeleteId(comment.id)}
                                className="w-full text-left px-3 py-1.5 text-xs font-semibold hover:bg-gray-50 text-destructive flex items-center gap-2 rounded-md cursor-pointer"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                                削除
                              </button>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </div>
                    {editingCommentId === comment.id ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          disabled={isUpdatingCommentId === comment.id}
                          maxLength={800}
                          rows={3}
                          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-hidden focus:border-foreground bg-white text-foreground resize-none font-sans"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancelEditComment}
                            disabled={isUpdatingCommentId === comment.id}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer"
                          >
                            キャンセル
                          </Button>
                          <Button
                            type="button"
                            disabled={isUpdatingCommentId === comment.id || !editingCommentText.trim()}
                            onClick={() => handleSaveCommentEdit(comment.id)}
                            className="bg-foreground text-background hover:bg-foreground/90 font-bold px-3 py-1.5 text-xs rounded-lg cursor-pointer"
                          >
                            保存
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed break-words">
                        {comment.comment}
                      </p>
                    )}
                  </div>
                );
              })
          )}
        </div>

        {/* ボトムインジケーター */}
        {todo.comments.filter(c => !c.delete_flag).length > 0 && (
          <div className="w-full flex flex-col justify-center items-center gap-2 py-6 text-muted-foreground/50">
            <MessageSquare className="h-5 w-5 stroke-1" />
            <p className="text-xs">
              {messages["todo-detail.comment.last-label"]}
            </p>
          </div>
        )}
      </section>

      {/* コメント削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={commentToDeleteId !== null}
        onOpenChange={(open) => !open && setCommentToDeleteId(null)}
        title={
          <>
            <AlertCircle size={20} className="text-destructive" />
            {messages["common.delete"]}
          </>
        }
        description={messages["todo-detail.comment.confirm-delete"]}
        confirmText={messages["common.delete"]}
        cancelText={messages["common.cancel"]}
        buttonLayout="vertical"
        onConfirm={async () => {
          if (commentToDeleteId !== null) {
            const id = commentToDeleteId;
            setCommentToDeleteId(null);
            await handleDeleteComment(id);
          }
        }}
      />

      {/* TODO削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={isDeleteTodoDialogOpen}
        onOpenChange={setIsDeleteTodoDialogOpen}
        title={
          <>
            <AlertCircle size={20} className="text-destructive" />
            {todo.delete_flag
              ? messages["todo-detail.delete-permanently.dialog.title"]
              : messages["todo-detail.delete.dialog.title"]}
          </>
        }
        description={
          todo.delete_flag
            ? messages["todo-detail.delete-permanently.dialog.confirm"]
            : messages["todo-detail.delete.dialog.confirm"]
        }
        confirmText={
          todo.delete_flag
            ? messages["todo-detail.delete-permanently.button"]
            : messages["common.delete.verb"]
        }
        cancelText={messages["common.cancel"]}
        buttonLayout="vertical"
        isConfirmDisabled={isDeletingTodo}
        isSubmitting={isDeletingTodo}
        onConfirm={async () => {
          setIsDeletingTodo(true);
          try {
            await handleDeleteTodo(mode, todo.delete_flag);
          } catch {
            // フック内で処理される
          } finally {
            setIsDeletingTodo(false);
            setIsDeleteTodoDialogOpen(false);
          }
        }}
      />
    </PageContainer>
  );
};
