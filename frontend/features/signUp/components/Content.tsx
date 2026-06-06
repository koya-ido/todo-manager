"use client";

import { ErrorContext } from "@/components/features/ErrorProvider";
import { Button } from "@/components/forms/Button";
import { InputField } from "@/components/forms/FieldWrapper/components/InputField";
import { PasswordField } from "@/components/forms/FieldWrapper/components/PasswordField";
import { Card } from "@/components/Layout/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/Layout/Dialog";
import { LabelWithIcon } from "@/components/Layout/LabelWithIcon/LabelWithIcon";
import { Heading } from "@/components/typography/Heading";
import { useSignUp } from "@/features/signUp/hooks/useSignUp";
import { SignUpResponse } from "@/features/signUp/types";
import { ContentProps } from "@/types/contentTypes";
import { Circle, CircleCheck, Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FC, SubmitEvent, useContext, useMemo, useState } from "react";
import { toast } from "sonner";

export const Content: FC<ContentProps> = ({ messages }) => {
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isSuccessSignUp, setIsSuccessSignUp] = useState<boolean>(false);
  const { handleSignUp } = useSignUp();

  const { setErrorResponse } = useContext(ErrorContext);

  const isUserName5CharactersOrMoreAnd30CharactersOrLess: boolean =
    useMemo(() => {
      return userName.length >= 5 && userName.length <= 30;
    }, [userName]);
  const isUserNameOnlyHalfWidthAlphanumericAndUnderscore: boolean =
    useMemo(() => {
      return /^[a-zA-Z0-9_]+$/.test(userName);
    }, [userName]);
  const isPassword8CharactersOrMore: boolean = useMemo(() => {
    return password.length >= 8;
  }, [password]);
  const isPasswordOnlyHalfWidth: boolean = useMemo(() => {
    return /^[\x20-\x7E]+$/.test(password);
  }, [password]);
  const isPasswordIncludesUppercaseLetter: boolean = useMemo(() => {
    return /[A-Z]/.test(password);
  }, [password]);
  const isPasswordIncludesLowercaseLetter: boolean = useMemo(() => {
    return /[a-z]/.test(password);
  }, [password]);
  const isPasswordIncludesNumber: boolean = useMemo(() => {
    return /[0-9]/.test(password);
  }, [password]);
  const isPasswordIncludesSymbol: boolean = useMemo(() => {
    // スペースを含まず、/*-+.,!#$%&()|_のいずれかを含む
    return /[/*\-+.,!#$%&()|_]/.test(password) && !/\s/.test(password);
  }, [password]);
  const isConfirmPasswordMatchesPassword: boolean = useMemo(() => {
    return confirmPassword.length > 0 && password === confirmPassword;
  }, [password, confirmPassword]);

  const userNameChecklist = [
    {
      isValid: isUserName5CharactersOrMoreAnd30CharactersOrLess,
      message: messages["common.username.checklist-1"],
    },
    {
      isValid: isUserNameOnlyHalfWidthAlphanumericAndUnderscore,
      message: messages["common.username.checklist-2"],
    },
  ];

  const passwordChecklist = [
    {
      isValid: isPassword8CharactersOrMore,
      message: messages["common.password.checklist-1"],
    },
    {
      isValid: isPasswordOnlyHalfWidth,
      message: messages["common.password.checklist-2"],
    },
    {
      isValid: isPasswordIncludesUppercaseLetter,
      message: messages["common.password.checklist-3"],
    },
    {
      isValid: isPasswordIncludesLowercaseLetter,
      message: messages["common.password.checklist-4"],
    },
    {
      isValid: isPasswordIncludesNumber,
      message: messages["common.password.checklist-5"],
    },
    {
      isValid: isPasswordIncludesSymbol,
      message: messages["common.password.checklist-6"],
    },
  ];

  const confirmPasswordChecklist = [
    {
      isValid: isConfirmPasswordMatchesPassword,
      message: messages["common.confirm-password.checklist-1"],
    },
  ];

  const isSubmitDisabled: boolean = useMemo(() => {
    return !(
      isUserName5CharactersOrMoreAnd30CharactersOrLess &&
      isUserNameOnlyHalfWidthAlphanumericAndUnderscore &&
      isPassword8CharactersOrMore &&
      isPasswordOnlyHalfWidth &&
      isPasswordIncludesUppercaseLetter &&
      isPasswordIncludesLowercaseLetter &&
      isPasswordIncludesNumber &&
      isPasswordIncludesSymbol &&
      isConfirmPasswordMatchesPassword
    );
  }, [
    isConfirmPasswordMatchesPassword,
    isPassword8CharactersOrMore,
    isPasswordIncludesLowercaseLetter,
    isPasswordIncludesNumber,
    isPasswordIncludesSymbol,
    isPasswordIncludesUppercaseLetter,
    isPasswordOnlyHalfWidth,
    isUserName5CharactersOrMoreAnd30CharactersOrLess,
    isUserNameOnlyHalfWidthAlphanumericAndUnderscore,
  ]);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await handleSignUp(userName, password);

      // レスポンスからアクセストークンを取得
      const signUpResponse = response as SignUpResponse;
      if (signUpResponse.display_id) {
        setUserId(signUpResponse.display_id);
      }
    } catch (error: unknown) {
      return setErrorResponse(error);
    }

    // 取得したユーザIDを表示し、ログインページへの導線を提供
    setIsSuccessSignUp(true);
  };

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(userId);
      toast.success(messages["user.user-id.copy"], {
        position: "top-center",
      });
    } catch (error) {
      console.error("ユーザIDのコピーに失敗しました:", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <Image
        src="/assets/icons/ApplicationLogo.svg"
        alt="アプリケーションロゴ"
        width={40}
        height={40}
      />
      <Heading level={1}>{messages["sign-up.heading"]}</Heading>
      <div className="text-center">
        <Heading level={2}>{messages["sign-up.description"]}</Heading>
      </div>
      <Card>
        <form
          onSubmit={handleSubmit}
          suppressHydrationWarning
          className="w-full flex flex-col justify-center items-center gap-8"
          noValidate
        >
          <div className="flex flex-col w-full gap-2 justify-center items-center">
            <InputField
              label={messages["common.label.username"]}
              placeholder={messages["common.label.username"]}
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <div className="w-full flex flex-col gap-2">
              {userNameChecklist.map((check, index) => (
                <LabelWithIcon
                  key={index}
                  icon={
                    check.isValid ? (
                      <CircleCheck size={12} color="#35B820" />
                    ) : (
                      <Circle size={12} color="#888888" />
                    )
                  }
                  label={check.message}
                  className={
                    check.isValid ? "text-[#35B820]" : "text-[#888888]"
                  }
                />
              ))}
            </div>
            <PasswordField
              label={messages["common.label.password"]}
              placeholder={messages["common.label.password"]}
              type="password"
              required
              className="h-6.25 bg-background"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="w-full flex flex-col gap-2">
              {passwordChecklist.map((check, index) => (
                <LabelWithIcon
                  key={index}
                  icon={
                    check.isValid ? (
                      <CircleCheck size={12} color="#35B820" />
                    ) : (
                      <Circle size={12} color="#888888" />
                    )
                  }
                  label={check.message}
                  className={
                    check.isValid ? "text-[#35B820]" : "text-[#888888]"
                  }
                />
              ))}
            </div>

            <PasswordField
              label={messages["common.label.confirm-password"]}
              placeholder={messages["common.label.confirm-password"]}
              type="password"
              required
              className="h-6.25 bg-background"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="w-full">
              {confirmPasswordChecklist.map((check, index) => (
                <LabelWithIcon
                  key={index}
                  icon={
                    check.isValid ? (
                      <CircleCheck size={12} color="#35B820" />
                    ) : (
                      <Circle size={12} color="#888888" />
                    )
                  }
                  label={check.message}
                  className={
                    check.isValid ? "text-[#35B820]" : "text-[#888888]"
                  }
                />
              ))}
            </div>
          </div>
          <Button type="submit" disabled={isSubmitDisabled} className="w-full">
            {messages["sign-up.register"]}
          </Button>
        </form>
      </Card>
      <section className="flex flex-col items-center gap-2">
        <p>{messages["sign-up.sign-in.sentence"]}</p>
        <Link
          href="/login"
          className="text-sm text-primary font-bold underline"
        >
          {messages["sign-up.sign-in.link"]}
        </Link>
      </section>
      <Dialog open={isSuccessSignUp}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{messages["sign-up.success.title"]}</DialogTitle>
          </DialogHeader>
          <div className="w-full flex flex-col justify-center items-center gap-4">
            <p>{messages["sign-up.success.description"]}</p>
            <div className="flex gap-1 items-center">
              <p className="font-bold text-xl">ID: {userId}</p>
              <Button variant="ghost" onClick={() => handleCopyClick()}>
                <Copy size={16} color="#888888" />
              </Button>
            </div>
            <Link
              href="/login"
              className="text-sm text-primary font-bold underline"
            >
              {messages["sign-up.sign-in.link"]}
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
