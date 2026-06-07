"use client";

import { Skeleton } from "@/components/Layout/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Layout/Tabs";
import { Heading } from "@/components/typography/Heading";
import { Calendar, Users } from "lucide-react";
import { FC } from "react";
import { useTeamContent } from "../hooks/useTeamContent";
import { ApplyingTeamCard } from "./ApplyingTeamCard";
import { CancelApplyDialog } from "./CancelApplyDialog";
import { JoinedTeamCard } from "./JoinedTeamCard";
import { TeamSearchForm } from "./TeamSearchForm";
import { TeamSearchResultDialog } from "./TeamSearchResultDialog";

type TeamContentProps = {
  messages: Record<string, string>;
  locale?: string;
}

export const TeamContent: FC<TeamContentProps> = ({ messages, locale }) => {
  const {
    joinedTeams,
    applyingTeams,
    isLoading,
    searchId,
    setSearchId,
    isSearching,
    searchedTeam,
    showSearchModal,
    setShowSearchModal,
    applyPassword,
    setApplyPassword,
    isSubmittingApply,
    applyError,
    cancelTarget,
    setCancelTarget,
    isSubmittingCancel,
    activeTab,
    setActiveTab,
    handleSearchSubmit,
    handleApplySubmit,
    handleCancelApply,
    handleConfirmCancelApply,
  } = useTeamContent(messages);

  return (
    <div className="w-full flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Title & Description */}
      <div>
        <Heading level={1}>{messages["team.heading"]}</Heading>
        <Heading level={2}>
          {messages["team.description"]}
        </Heading>
      </div>

      {/* Search Bar */}
      <TeamSearchForm
        messages={messages}
        searchId={searchId}
        setSearchId={setSearchId}
        isSearching={isSearching}
        onSubmit={handleSearchSubmit}
      />

      {/* Tabs Menu & Content Section */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "joined" | "applying")}
        className="w-full"
      >
        <TabsList
          variant="line"
          className="w-full justify-start rounded-none p-0 bg-transparent gap-2"
        >
          <TabsTrigger
            value="joined"
            className="px-3 sm:px-6 py-3 text-sm font-semibold transition-all border-b-2 rounded-none bg-transparent flex-1 sm:flex-none justify-center sm:justify-start flex items-center gap-1.5 data-[state=active]:text-foreground dark:data-[state=active]:text-foreground text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-transparent"
          >
            <Users className="w-4 h-4" />
            {messages["team.tab.joined"]}
            {joinedTeams.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-2xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono font-bold">
                {joinedTeams.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="applying"
            className="px-3 sm:px-6 py-3 text-sm font-semibold transition-all border-b-2 rounded-none bg-transparent flex-1 sm:flex-none justify-center sm:justify-start flex items-center gap-1.5 data-[state=active]:text-foreground dark:data-[state=active]:text-indigo-400 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-transparent"
          >
            <Calendar className="w-4 h-4" />
            {messages["team.tab.applying"]}
            {applyingTeams.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-2xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono font-bold">
                {applyingTeams.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <section className="min-h-40 mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 p-5 space-y-4"
                >
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="joined">
                {joinedTeams.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                    <Users className="w-12 h-12 text-slate-400 mb-4 animate-pulse" />
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                      {messages["team.joined-teams.empty.title"]}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {messages["team.joined-teams.empty.description"]}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {joinedTeams.map((team) => (
                      <JoinedTeamCard key={team.id} team={team} messages={messages} />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="applying">
                {applyingTeams.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-xl border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
                    <Calendar className="w-12 h-12 text-slate-400 mb-4 animate-pulse" />
                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                      {messages["team.applying-teams.empty.title"]}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {messages["team.applying-teams.empty.description"]}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {applyingTeams.map((team) => (
                      <ApplyingTeamCard
                        key={team.id}
                        team={team}
                        messages={messages}
                        locale={locale}
                        onCancel={handleCancelApply}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </section>
      </Tabs>

      {/* Search Result Dialog / Modal */}
      <TeamSearchResultDialog
        isOpen={showSearchModal}
        onOpenChange={setShowSearchModal}
        searchedTeam={searchedTeam}
        applyPassword={applyPassword}
        setApplyPassword={setApplyPassword}
        isSubmittingApply={isSubmittingApply}
        applyError={applyError}
        onSubmitApply={handleApplySubmit}
        messages={messages}
      />

      {/* Cancel Confirmation Dialog */}
      <CancelApplyDialog
        cancelTarget={cancelTarget}
        onClose={() => setCancelTarget(null)}
        isSubmittingCancel={isSubmittingCancel}
        onConfirm={() => void handleConfirmCancelApply()}
        messages={messages}
      />
    </div>
  );
};
