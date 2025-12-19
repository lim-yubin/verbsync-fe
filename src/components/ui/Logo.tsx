"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import LogoDark from "@/assets/icons/logo-dark.svg?react";
import LogoLight from "@/assets/icons/logo-light.svg?react";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = "", width = 32, height = 32 }: LogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // SSR hydration 이슈 방지
  if (!mounted) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width, height }}
      />
    );
  }

  // 테마 결정: theme이 'system'이면 systemTheme 사용, 아니면 theme 사용
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const LogoComponent = isDark ? LogoDark : LogoLight;

  return (
    <LogoComponent
      className={className}
      width={width}
      height={height}
    />
  );
}

