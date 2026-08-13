"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { SidebarMenuButton } from "@/components/ui/sidebar";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarMenuButton 
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors rounded-md w-full justify-start"
    >
      <Sun className="h-3.5 w-3.5 mr-1 dark:hidden" />
      <Moon className="h-3.5 w-3.5 mr-1 hidden dark:block" />
      <span>Toggle Theme</span>
    </SidebarMenuButton>
  );
}
