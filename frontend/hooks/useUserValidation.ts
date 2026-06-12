import { useMemo } from "react";

export const useUserValidation = (
  userName: string,
  password: string,
  confirmPassword?: string,
) => {
  const isUserName5CharactersOrMoreAnd30CharactersOrLess = useMemo(() => {
    return userName.length >= 5 && userName.length <= 30;
  }, [userName]);

  const isUserNameOnlyHalfWidthAlphanumericAndUnderscore = useMemo(() => {
    return /^[a-zA-Z0-9_]+$/.test(userName);
  }, [userName]);

  const isPassword8CharactersOrMore = useMemo(() => {
    return password.length >= 8;
  }, [password]);

  const isPasswordOnlyHalfWidth = useMemo(() => {
    return /^[\x20-\x7E]+$/.test(password);
  }, [password]);

  const isPasswordIncludesUppercaseLetter = useMemo(() => {
    return /[A-Z]/.test(password);
  }, [password]);

  const isPasswordIncludesLowercaseLetter = useMemo(() => {
    return /[a-z]/.test(password);
  }, [password]);

  const isPasswordIncludesNumber = useMemo(() => {
    return /[0-9]/.test(password);
  }, [password]);

  const isPasswordIncludesSymbol = useMemo(() => {
    return /[/*\-+.,!#$%&()|_]/.test(password) && !/\s/.test(password);
  }, [password]);

  const isConfirmPasswordMatchesPassword = useMemo(() => {
    return (
      confirmPassword !== undefined &&
      confirmPassword.length > 0 &&
      password === confirmPassword
    );
  }, [password, confirmPassword]);

  return {
    isUserName5CharactersOrMoreAnd30CharactersOrLess,
    isUserNameOnlyHalfWidthAlphanumericAndUnderscore,
    isPassword8CharactersOrMore,
    isPasswordOnlyHalfWidth,
    isPasswordIncludesUppercaseLetter,
    isPasswordIncludesLowercaseLetter,
    isPasswordIncludesNumber,
    isPasswordIncludesSymbol,
    isConfirmPasswordMatchesPassword,
  };
};
