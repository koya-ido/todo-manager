"use client";

import { ErrorContext } from "@/components/features/ErrorProvider";
import { Button } from "@/components/forms/Button";
import { Card } from "@/components/Layout/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/Layout/Dialog";
import { Heading } from "@/components/typography/Heading";
import { useSignUp } from "@/features/signUp/hooks/useSignUp";
import { SignUpResponse } from "@/features/signUp/types";
import { UserFormFields } from "@/features/user/components/UserFormFields";
import { useUserValidation } from "@/hooks/useUserValidation";
import { ContentProps } from "@/types/contentTypes";
import { Copy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FC, SubmitEvent, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Content: FC<ContentProps> = ({ messages }) => {
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isSuccessSignUp, setIsSuccessSignUp] = useState<boolean>(false);
  const { handleSignUp } = useSignUp();

  const { getInlineError, setErrorResponse, clearInlineErrors } = useContext(ErrorContext);

  useEffect(() => {
    clearInlineErrors();
    return () => clearInlineErrors();
  }, [clearInlineErrors]);

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
    <div className="flex flex-col justify-center w-full items-center gap-5">
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
            <UserFormFields
              messages={messages}
              userName={userName}
              setUserName={setUserName}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              getInlineError={getInlineError}
            />
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
