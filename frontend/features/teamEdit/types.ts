import { ContentProps } from "@/types/contentTypes";

export type TeamEditProps = ContentProps & {
  isNew?: boolean;
  teamId?: number;
};

export type TeamFormState = {
  name: string;
  password?: string;
  confirmPassword?: string;
};

export type TeamFieldErrors = {
  name?: string;
  password?: string;
  confirmPassword?: string;
};

export type TeamResponse = {
  id: number;
  display_teams_id: string;
  name: string;
  created_user_id: number;
  created_user_name: string;
  created_user_display_id: string;
  is_owner: boolean;
  accepting_applications: boolean;
};
