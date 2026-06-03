import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (v: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true,
      toggle: () =>
        set((s) => {
          const next = !s.isDark;
          document.documentElement.classList.toggle("light", !next);
          return { isDark: next };
        }),
      setDark: (v) => {
        document.documentElement.classList.toggle("light", !v);
        set({ isDark: v });
      },
    }),
    { name: "apextask-theme" }
  )
);
