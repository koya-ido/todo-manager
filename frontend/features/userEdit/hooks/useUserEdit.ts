import { MeResponse } from "@/components/features/AuthSessionProvider/types";
import { ErrorContext } from "@/components/features/ErrorProvider";
import { apiGet, apiPut } from "@/hooks/useFetchApi";
import { useUserValidation } from "@/hooks/useUserValidation";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type UseUserEditProps = {
  messages: Record<string, string>;
};

export const useUserEdit = ({ messages }: UseUserEditProps) => {
  const router = useRouter();
  const { getInlineError, setErrorResponse, clearInlineErrors } =
    useContext(ErrorContext);

  const [userName, setUserName] = useState<string>("");
  const [originalUserName, setOriginalUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);

  useEffect(() => {
    clearInlineErrors();
    return () => clearInlineErrors();
  }, [clearInlineErrors]);

  // 現在のユーザー情報を読み込む
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiGet<MeResponse>("/me");
        setUserName(response.user_name);
        setOriginalUserName(response.user_name);
        setIsAvailable(true);
      } catch (error) {
        setErrorResponse(error);
        toast.error(
          messages["FAILED_TO_FETCH"]?.replace(
            "{name}",
            messages["user.username"],
          ),
        );
      } finally {
        setIsLoading(false);
      }
    };
    void fetchUser();
  }, [setErrorResponse, messages]);

  // ユーザー名の重複チェックを遅延させる
  useEffect(() => {
    if (isLoading) return;

    if (!userName) {
      setIsAvailable(false);
      setIsCheckingUsername(false);
      return;
    }

    if (userName === originalUserName) {
      setIsAvailable(true);
      setIsCheckingUsername(false);
      return;
    }

    const isLengthValid = userName.length >= 5 && userName.length <= 30;
    const isFormatValid = /^[a-zA-Z0-9_]+$/.test(userName);
    if (!isLengthValid || !isFormatValid) {
      setIsAvailable(false);
      setIsCheckingUsername(false);
      return;
    }

    setIsCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const res = await apiGet<{ available: boolean }>(
          `/user/check-username?username=${encodeURIComponent(userName)}`,
        );
        setIsAvailable(res.available);
      } catch {
        setIsAvailable(false);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [userName, originalUserName, isLoading]);

  const {
    isUserName5CharactersOrMoreAnd30CharactersOrLess,
    isUserNameOnlyHalfWidthAlphanumericAndUnderscore,
    isPassword8CharactersOrMore,
    isPasswordOnlyHalfWidth,
    isPasswordIncludesUppercaseLetter,
    isPasswordIncludesLowercaseLetter,
    isPasswordIncludesNumber,
    isPasswordIncludesSymbol,
    isConfirmPasswordMatchesPassword,
  } = useUserValidation(userName, password, confirmPassword);

  const isSubmitDisabled = useMemo(() => {
    return (
      isLoading ||
      isSubmitting ||
      isCheckingUsername ||
      !(
        isUserName5CharactersOrMoreAnd30CharactersOrLess &&
        isUserNameOnlyHalfWidthAlphanumericAndUnderscore &&
        isAvailable &&
        isPassword8CharactersOrMore &&
        isPasswordOnlyHalfWidth &&
        isPasswordIncludesUppercaseLetter &&
        isPasswordIncludesLowercaseLetter &&
        isPasswordIncludesNumber &&
        isPasswordIncludesSymbol &&
        isConfirmPasswordMatchesPassword
      )
    );
  }, [
    isLoading,
    isSubmitting,
    isCheckingUsername,
    isUserName5CharactersOrMoreAnd30CharactersOrLess,
    isUserNameOnlyHalfWidthAlphanumericAndUnderscore,
    isAvailable,
    isPassword8CharactersOrMore,
    isPasswordOnlyHalfWidth,
    isPasswordIncludesUppercaseLetter,
    isPasswordIncludesLowercaseLetter,
    isPasswordIncludesNumber,
    isPasswordIncludesSymbol,
    isConfirmPasswordMatchesPassword,
  ]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitDisabled) return;

    setIsSubmitting(true);
    try {
      await apiPut(
        "/user/me",
        JSON.stringify({
          username: userName,
          password: password,
        }),
      );
      toast.success(messages["user-edit.toast.update-success"]);
      router.push("/user");
      router.refresh();
    } catch (error: unknown) {
      setErrorResponse(error);
      toast.error(
        messages["FAILED_TO_UPDATE"]?.replace(
          "{name}",
          messages["user.username"],
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    userName,
    setUserName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    isSubmitting,
    isCheckingUsername,
    isAvailable,
    isUserName5CharactersOrMoreAnd30CharactersOrLess,
    isUserNameOnlyHalfWidthAlphanumericAndUnderscore,
    isPassword8CharactersOrMore,
    isPasswordOnlyHalfWidth,
    isPasswordIncludesUppercaseLetter,
    isPasswordIncludesLowercaseLetter,
    isPasswordIncludesNumber,
    isPasswordIncludesSymbol,
    isConfirmPasswordMatchesPassword,
    isSubmitDisabled,
    handleSubmit,
    getInlineError,
  };
};
