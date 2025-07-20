 "use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (!isMounted) console.warn("ThemeToggle mounted but not yet rendered");
  };

  if (!isMounted) return null;

  const label = `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      onClick={toggleTheme}
      className={cn("relative transition-opacity duration-200", {
        "bg-green-500 text-white hover:bg-green-600": resolvedTheme === "dark",
      })}
    >
      <Sun
        className={cn(
          "h-5 w-5 transition-transform duration-200",
          resolvedTheme === "dark" ? "scale-0" : "scale-100"
        )}
      />
      <Moon
        className={cn(
          "absolute h-5 w-5 transition-transform duration-200",
          resolvedTheme === "dark" ? "scale-100" : "scale-0"
        )}
      />
      <span className="sr-only">{label}</span>
    </Button>
  );
}   
