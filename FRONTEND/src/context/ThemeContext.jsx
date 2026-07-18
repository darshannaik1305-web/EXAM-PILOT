import { createContext, useState, useEffect } from "react";

export const ThemeContext = createContext();

const THEME_KEY = "exampilot_settings_theme";

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(THEME_KEY) || "DARK";
  });

  const setTheme = (newTheme) => {
    localStorage.setItem(THEME_KEY, newTheme);
    setThemeState(newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme() {
      if (theme === "LIGHT") {
        root.classList.add("light");
      } else if (theme === "DARK") {
        root.classList.remove("light");
      } else if (theme === "SYSTEM") {
        const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (systemIsDark) {
          root.classList.remove("light");
        } else {
          root.classList.add("light");
        }
      }
    }

    applyTheme();

    // Listen for OS system theme changes if set to SYSTEM
    if (theme === "SYSTEM") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme();
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
