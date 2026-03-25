"use client";

import dynamic from "next/dynamic";

// Lazy-load heavy interactive components — only hydrate after page is interactive.
// This prevents MatrixRain, CursorTrail, CyberTerminal, and ChatbotWidget
// from blocking FCP/LCP/TTI on every page.

const MatrixRain = dynamic(() => import("@/components/interactive/MatrixRain"), {
  ssr: false,
});

const CursorTrail = dynamic(() => import("@/components/interactive/CursorTrail"), {
  ssr: false,
});

const CyberTerminal = dynamic(
  () => import("@/components/interactive/CyberTerminal"),
  { ssr: false },
);

const ChatbotWidget = dynamic(() => import("@/components/ChatbotWidget"), {
  ssr: false,
});

const CommandPalette = dynamic(() => import("@/components/CommandPalette"), {
  ssr: false,
});

const KonamiEasterEgg = dynamic(
  () => import("@/components/interactive/KonamiEasterEgg"),
  { ssr: false },
);

const SoundEffects = dynamic(
  () => import("@/components/interactive/SoundEffects"),
  { ssr: false },
);

export function LazyInteractive() {
  return (
    <>
      <ChatbotWidget />
      <CyberTerminal />
      <MatrixRain />
      <CursorTrail />
      <CommandPalette />
      <KonamiEasterEgg />
      <SoundEffects />
    </>
  );
}
