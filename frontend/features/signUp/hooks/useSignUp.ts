import { SignUpResponse } from "@/features/signUp/types";
import { ErrorResponse } from "@/hooks/useError/types";
import { apiPost } from "@/hooks/useFetchApi";

export const useSignUp = () => {
  const handleSignUp = async (userId: string, password: string) => {
    try {
      const response = await apiPost<SignUpResponse | ErrorResponse>(
        "/signup",
        JSON.stringify({
          username: userId,
          password,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response;
    } catch (error) {
      throw error;
    }
  };
  return { handleSignUp };
};
