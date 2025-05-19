import { createContext, useContext, useEffect, useState } from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

/**
 * Theme context to access theme mode and setter functions
 */
type ThemeContextType = {
  theme: string | undefined;
  setTheme: (theme: string) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme provider component to handle theme switching and persistence
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme on component mount
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    // Listen for system theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    darkModeMediaQuery.addEventListener("change", handleChange);
    return () => darkModeMediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      <ThemeContext.Provider
        value={{
          theme: isDarkMode ? "dark" : "light",
          setTheme: (theme: string) => {
            setIsDarkMode(theme === "dark");
            document.documentElement.classList.toggle("dark", theme === "dark");
          },
          isDarkMode,
          toggleTheme: () => {
            const newTheme = isDarkMode ? "light" : "dark";
            setIsDarkMode(!isDarkMode);
            document.documentElement.classList.toggle("dark", !isDarkMode);
          },
        }}
      >
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  );
}

/**
 * Hook to access theme context
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
