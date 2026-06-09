export type TeamSearchResponse = {
  id: number;
  display_teams_id: string;
  name: string;
  created_user_name: string;
  created_user_display_id: string;
  is_member: boolean;
  is_applying: boolean;
  accepting_applications: boolean;
};

export type TeamJoinedResponse = {
  id: number;
  display_teams_id: string;
  name: string;
  created_user_id: number;
  created_user_name: string;
  created_user_display_id: string;
  member_count: number;
  is_owner: boolean;
};

export type TeamApplyingResponse = {
  id: number;
  display_teams_id: string;
  name: string;
  created_user_name: string;
  created_user_display_id: string;
  applied_at: string;
};

export type TeamApplicantResponse = {
  id: number;
  display_user_id: string;
  user_name: string;
  applied_at: string;
};

export type TeamDetailResponse = {
  id: number;
  display_teams_id: string;
  name: string;
  created_user_id: number;
  created_user_name: string;
  created_user_display_id: string;
  is_owner: boolean;
  accepting_applications: boolean;
  password?: string;
};

export type TeamMemberResponse = {
  id: number;
  display_user_id: string;
  user_name: string;
  is_owner: boolean;
};
