import { Member } from "@/features/todoEdit/types";
import { apiGet } from "@/hooks/useFetchApi";
import { TodoMode } from "@/types/todo";
import { useEffect, useState } from "react";

type UseTeamMembersProps = {
  mode: TodoMode;
  currentTeamId?: number;
  setErrorResponse: (error: unknown) => void;
};

export const useTeamMembers = ({
  mode,
  currentTeamId,
  setErrorResponse,
}: UseTeamMembersProps) => {
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (mode !== "team" || !currentTeamId) return;

    const fetchMembers = async () => {
      try {
        const data = await apiGet<Member[]>(
          `/user/team/${currentTeamId}/members`,
        );
        setMembers(data);
      } catch (error) {
        setErrorResponse(error);
      }
    };
    void fetchMembers();
  }, [mode, currentTeamId, setErrorResponse]);

  return {
    members,
    setMembers,
  };
};
