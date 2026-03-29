"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { type ReactNode, useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { TooltipProvider } from "@/components/ui/tooltip";

// Defer toast renderers — only needed when a toast fires, not on initial render
const Toaster = dynamic(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = dynamic(() => import("sonner").then(m => ({ default: m.Toaster })));

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Query client timing constants
  const STALE_TIME_MINUTES = 1;
  const GC_TIME_MINUTES = 5;
  const MS_PER_SECOND = 1000;
  const SECONDS_PER_MINUTE = 60;

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND, // 1 minute
            gcTime: GC_TIME_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="portfolio-theme"
        >
          <TooltipProvider delayDuration={0}>
            {children}
            <Toaster />
            <Sonner
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast:
                    "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                  description: "group-[.toast]:text-muted-foreground",
                  actionButton:
                    "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                  cancelButton:
                    "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                },
              }}
            />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
