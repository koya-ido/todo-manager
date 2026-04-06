import { MeResponse } from "@/components/features/AuthSessionProvider/types";
import { ErrorContext } from "@/components/features/ErrorProvider";
import { ErrorResponse } from "@/hooks/useError/types";
import { apiGet } from "@/hooks/useFetchApi";
import { useContext, useEffect, useState } from "react";

export const useUser = () => {
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const { setErrorResponse } = useContext(ErrorContext);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response: MeResponse | ErrorResponse = await apiGet<
          MeResponse | ErrorResponse
        >("/me");

        if ("display_user_id" in response) {
          setUserId(response.display_user_id);
          setUserName(response.user_name);
          return;
        }
      } catch (error) {
        setErrorResponse(error);
      }
    };
    void fetchUserInfo();
  }, []);

  return { userId, userName };
};
