"use client";

import { createContext, useContext, type ReactNode } from "react";

export type AnalyzeTheme = "light" | "dark";

const AnalyzeThemeContext = createContext<AnalyzeTheme>("dark");

export function AnalyzeThemeProvider({
  theme = "light",
  children,
}: {
  theme?: AnalyzeTheme;
  children: ReactNode;
}) {
  return (
    <AnalyzeThemeContext.Provider value={theme}>
      {children}
    </AnalyzeThemeContext.Provider>
  );
}

export function useAnalyzeTheme(): AnalyzeTheme {
  return useContext(AnalyzeThemeContext);
}
