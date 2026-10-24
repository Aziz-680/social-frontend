"use client";

import { useEffect } from "react";
import Icon from "./Icon";

export default function ThemeToggle() {
  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      window.localStorage.getItem("social-theme") === "dark",
    );
  }, []);

  const toggleTheme = () => {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("social-theme", dark ? "dark" : "light");
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <span className="theme-icon-light"><Icon name="moon" /></span>
      <span className="theme-icon-dark"><Icon name="sun" /></span>
    </button>
  );
}
