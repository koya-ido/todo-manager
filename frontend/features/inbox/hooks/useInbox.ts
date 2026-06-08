"use client";

import { ErrorContext } from "@/components/features/ErrorProvider";
import { apiDelete, apiGet } from "@/hooks/useFetchApi";
import { useCallback, useContext, useEffect, useState } from "react";

export type InboxItem = {
  id: number;
  target_user_id: number;
  todo_id: number | null;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  todo: {
    id: number;
    name: string;
    team_name: string | null;
  } | null;
};

export const useInbox = () => {
  const [inboxes, setInboxes] = useState<InboxItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const { setErrorResponse } = useContext(ErrorContext);

  const fetchInboxes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<InboxItem[]>("/inbox");
      setInboxes(data);
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setIsLoading(false);
    }
  }, [setErrorResponse]);

  useEffect(() => {
    void fetchInboxes();
  }, [fetchInboxes]);

  const deleteInboxItem = useCallback(
    async (id: number) => {
      setDeletingIds((prev) => [...prev, id]);
      // アニメーション完了（300ms）を待ってからAPI呼び出しと状態更新
      await new Promise((resolve) => setTimeout(resolve, 300));

      try {
        await apiDelete(`/inbox/${id}`);
        setInboxes((prev) => prev.filter((item) => item.id !== id));
      } catch (error) {
        setErrorResponse(error);
        // 失敗した場合はフェードアウト状態を戻す
        setDeletingIds((prev) => prev.filter((prevId) => prevId !== id));
      }
    },
    [setErrorResponse],
  );

  return {
    inboxes,
    isLoading,
    deletingIds,
    deleteInboxItem,
    refresh: fetchInboxes,
  };
};
