"use client";

import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from "next-themes";
import { FC } from "react";

export const ThemeProvider: FC<ThemeProviderProps> = (props) => {
  return <NextThemesProvider {...props}>{props.children}</NextThemesProvider>;
};
