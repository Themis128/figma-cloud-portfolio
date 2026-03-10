"use client";

import { Settings } from "lucide-react";

export function ManageCookiesButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 transition-colors font-mono text-sm uppercase tracking-wider"
      onClick={() => {
        window.dispatchEvent(new CustomEvent("open-cookie-settings"));
      }}
    >
      <Settings className="w-4 h-4" />
      Manage Cookies
    </button>
  );
}
