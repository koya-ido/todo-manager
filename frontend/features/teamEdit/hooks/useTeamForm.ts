import { ErrorContext } from "@/components/features/ErrorProvider";
import {
  TeamFieldErrors,
  TeamFormState,
  TeamResponse,
} from "@/features/teamEdit/types";
import { isStateDirty } from "@/features/teamEdit/utils";
import { useNavigationGuard } from "@/features/todoEdit/hooks/useNavigationGuard";
import { isErrorResponse } from "@/hooks/useError/errorUtils";
import { apiGet, apiPost, apiPut } from "@/hooks/useFetchApi";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type UseTeamFormProps = {
  isNew: boolean;
  teamId?: number;
  messages: Record<string, string>;
};

export const useTeamForm = ({ isNew, teamId, messages }: UseTeamFormProps) => {
  const router = useRouter();
  const { setErrorResponse, clearInlineErrors } = useContext(ErrorContext);

  useEffect(() => {
    clearInlineErrors();
    return () => clearInlineErrors();
  }, [clearInlineErrors]);

  // フォーム状態
  const [name, setName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // UI状態
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 破棄確認状態
  const [initialState, setInitialState] = useState<TeamFormState | null>(null);

  // バリデーション状態
  const [fieldErrors, setFieldErrors] = useState<TeamFieldErrors>({});

  const handleNameChange = (val: string) => {
    setName(val);
    setFieldErrors((prev) => {
      const nextErrors = { ...prev };
      if (!val.trim()) {
        nextErrors.name = messages["validate.required"];
      } else if (val.length > 255) {
        nextErrors.name = messages["validate.maxLength"]?.replace(
          "{max}",
          "255",
        );
      } else {
        delete nextErrors.name;
      }
      return nextErrors;
    });
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    setFieldErrors((prev) => {
      const nextErrors = { ...prev };
      if (isNew && !val) {
        nextErrors.password = messages["validate.required"];
      } else if (val && val.length < 8) {
        nextErrors.password = messages["common.password.checklist-1"];
      } else {
        delete nextErrors.password;
      }

      if (confirmPassword && val !== confirmPassword) {
        nextErrors.confirmPassword =
          messages["common.confirm-password.checklist-1"];
      } else if (confirmPassword && val === confirmPassword) {
        delete nextErrors.confirmPassword;
      }

      return nextErrors;
    });
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    setFieldErrors((prev) => {
      const nextErrors = { ...prev };
      if (password && val !== password) {
        nextErrors.confirmPassword =
          messages["common.confirm-password.checklist-1"];
      } else {
        delete nextErrors.confirmPassword;
      }
      return nextErrors;
    });
  };

  // 編集中の場合は既存のチームデータをロードする
  useEffect(() => {
    if (isNew || !teamId) return;

    const loadTeam = async () => {
      setIsLoading(true);
      try {
        const response = await apiGet<TeamResponse>(`/team/${teamId}`);
        setName(response.name);

        setInitialState({
          name: response.name,
          password: "",
          confirmPassword: "",
        });
        setIsLoading(false);
      } catch (error) {
        if (isErrorResponse(error)) {
          router.push(`/error?status=${error.status}&code=${error.code}`);
        } else {
          router.push("/error?status=500&code=UNKNOWN");
        }
      }
    };

    void loadTeam();
  }, [isNew, teamId, setErrorResponse, messages]);

  // 新規チームの初期状態を設定する
  useEffect(() => {
    if (isNew) {
      setInitialState({
        name: "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [isNew]);

  const isDirty = isStateDirty(
    {
      name,
      password,
      confirmPassword,
    },
    initialState,
  );

  // ナビゲーションガードフック
  const {
    showDiscardDialog,
    setShowDiscardDialog,
    handleConfirmDiscard,
    handleCancelDiscard,
  } = useNavigationGuard(isDirty && !isSubmitting, () => {
    setInitialState(null);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // クライアント側のバリデーション
    const newErrors: typeof fieldErrors = {};
    let isValid = true;

    // 表示用チームIDの検証：作成時にバックエンドによって生成されるため、ここでは検証しない。

    // 名前の検証
    if (!name.trim()) {
      newErrors.name = messages["validate.required"];
      isValid = false;
    } else if (name.length > 255) {
      newErrors.name = messages["validate.maxLength"]?.replace("{max}", "255");
      isValid = false;
    }

    // パスワードの検証
    if (isNew) {
      if (!password) {
        newErrors.password = messages["validate.required"];
        isValid = false;
      } else if (password.length < 8) {
        newErrors.password = messages["common.password.checklist-1"];
        isValid = false;
      }
    } else if (password && password.length < 8) {
      newErrors.password = messages["common.password.checklist-1"];
      isValid = false;
    }

    // 確認用パスワードの検証
    if (password && password !== confirmPassword) {
      newErrors.confirmPassword =
        messages["common.confirm-password.checklist-1"];
      isValid = false;
    }

    if (!isValid) {
      setFieldErrors(newErrors);
      toast.error("入力内容を確認してください");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isNew) {
        const payload = {
          name: name.trim(),
          password,
        };

        const response = await apiPost<TeamResponse>(
          "/team",
          JSON.stringify(payload),
        );
        toast.success(messages["team-edit.toast.create-success"]);
        setInitialState(null);
        router.push(`/team/${response.id}`);
      } else {
        const payload = {
          name: name.trim(),
          password: password || null,
        };

        const response = await apiPut<TeamResponse>(
          `/team/${teamId}`,
          JSON.stringify(payload),
        );
        toast.success(messages["team-edit.toast.update-success"]);
        setInitialState(null);
        router.push(`/team/${response.id}`);
      }
    } catch (error: any) {
      setErrorResponse(error);
      toast.error(
        isNew
          ? messages["FAILED_TO_CREATE"]?.replace(
              "{name}",
              messages["team.label"],
            )
          : messages["FAILED_TO_UPDATE"]?.replace(
              "{name}",
              messages["team.label"],
            ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled =
    isSubmitting ||
    !name.trim() ||
    (isNew && !password) ||
    (password && password !== confirmPassword) ||
    Object.keys(fieldErrors).length > 0;

  return {
    name,
    password,
    confirmPassword,
    isLoading,
    isSubmitting,
    showDiscardDialog,
    setShowDiscardDialog,
    fieldErrors,
    handleNameChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleSubmit,
    isSubmitDisabled,
    handleConfirmDiscard,
    handleCancelDiscard,
  };
};
