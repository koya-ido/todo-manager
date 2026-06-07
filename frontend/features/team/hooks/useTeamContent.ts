"use client";

import { ErrorContext } from "@/components/features/ErrorProvider";
import {
  TeamApplyingResponse,
  TeamJoinedResponse,
  TeamSearchResponse,
} from "@/features/team/types";
import { apiDelete, apiGet, apiPost } from "@/hooks/useFetchApi";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export const useTeamContent = (messages: Record<string, string>) => {
  const { setErrorResponse } = useContext(ErrorContext);

  // Lists and loading states
  const [joinedTeams, setJoinedTeams] = useState<TeamJoinedResponse[]>([]);
  const [applyingTeams, setApplyingTeams] = useState<TeamApplyingResponse[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Search state
  const [searchId, setSearchId] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchedTeam, setSearchedTeam] = useState<TeamSearchResponse | null>(
    null,
  );
  const [showSearchModal, setShowSearchModal] = useState<boolean>(false);

  // Join application state
  const [applyPassword, setApplyPassword] = useState<string>("");
  const [isSubmittingApply, setIsSubmittingApply] = useState<boolean>(false);
  const [applyError, setApplyError] = useState<string>("");

  // Cancel application confirmation state
  const [cancelTarget, setCancelTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState<boolean>(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<"joined" | "applying">("joined");

  // Load teams
  const loadTeamsData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const joined = await apiGet<TeamJoinedResponse[]>("/team/joined");
      const applying = await apiGet<TeamApplyingResponse[]>("/team/applying");
      setJoinedTeams(joined);
      setApplyingTeams(applying);
    } catch (error) {
      setErrorResponse(error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTeamsData();
  }, []);

  // Handle team search
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    setApplyError("");
    setApplyPassword("");
    try {
      const res = await apiGet<TeamSearchResponse>(
        `/team/search?display_teams_id=${encodeURIComponent(searchId.trim())}`,
      );
      setSearchedTeam(res);
      setShowSearchModal(true);
    } catch (error) {
      const err = error as { detail?: string };
      if (err && err.detail) {
        toast.error(err.detail);
      } else {
        toast.error(
          messages["FAILED_TO_FETCH"]?.replace(
            "{name}",
            messages["team.label"],
          ) || messages["team.toast.search-failed"],
        );
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Submit join application
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchedTeam || !applyPassword.trim()) return;

    setIsSubmittingApply(true);
    setApplyError("");
    try {
      await apiPost(
        `/team/${searchedTeam.id}/apply`,
        JSON.stringify({ password: applyPassword.trim() }),
      );
      toast.success(messages["team.toast.apply-success"]);
      setShowSearchModal(false);
      setSearchId("");
      void loadTeamsData(true);
    } catch (error) {
      const err = error as { detail?: string };
      if (err && err.detail) {
        setApplyError(err.detail);
      } else {
        setApplyError(messages["team.toast.apply-failed-password"]);
      }
    } finally {
      setIsSubmittingApply(false);
    }
  };

  // Cancel own application (Trigger confirmation modal)
  const handleCancelApply = (teamId: number, teamName: string) => {
    setCancelTarget({ id: teamId, name: teamName });
  };

  // Perform API request to cancel application
  const handleConfirmCancelApply = async () => {
    if (!cancelTarget) return;

    setIsSubmittingCancel(true);
    try {
      await apiDelete(`/team/${cancelTarget.id}/apply`);
      toast.success(messages["team.toast.cancel-success"]);
      setCancelTarget(null);
      void loadTeamsData(true);
    } catch (error) {
      setErrorResponse(error);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  return {
    joinedTeams,
    applyingTeams,
    isLoading,
    searchId,
    setSearchId,
    isSearching,
    searchedTeam,
    setSearchedTeam,
    showSearchModal,
    setShowSearchModal,
    applyPassword,
    setApplyPassword,
    isSubmittingApply,
    applyError,
    setApplyError,
    cancelTarget,
    setCancelTarget,
    isSubmittingCancel,
    activeTab,
    setActiveTab,
    handleSearchSubmit,
    handleApplySubmit,
    handleCancelApply,
    handleConfirmCancelApply,
  };
};
