"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || (!savedTheme && window.matchMedia("(prefers-color-scheme: light)").matches)) {
      setIsLight(true);
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isLight;
    setIsLight(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <div className="fixed left-4 top-4 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-[color:var(--surface)] px-3 py-1.5 shadow-xl backdrop-blur-md sm:left-6 sm:top-6">
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400/50 ${
          isLight ? "bg-cyan-500" : "bg-slate-600"
        }`}
        role="switch"
        aria-checked={isLight}
        aria-label="Toggle theme"
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            isLight ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
        {isLight ? "Light" : "Dark"}
      </span>
    </div>
  );
}
