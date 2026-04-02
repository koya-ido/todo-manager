import { ErrorResponse } from "@/hooks/useError/types";
import { apiPost } from "@/hooks/useFetchApi";

type LoginResponse = {
  access_token: string;
  token_type: string;
};

export const useLogin = () => {
  const handleLogin = async (userId: string, password: string) => {
    try {
      const response = await apiPost<LoginResponse | ErrorResponse>(
        "/login",
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
  return { handleLogin };
};
