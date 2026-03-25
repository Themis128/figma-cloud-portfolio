"use client";

import {
  Accessibility,
  Briefcase,
  ChevronRight,
  Command,
  FileText,
  Gauge,
  Globe,
  Home,
  Laptop,
  Mail,
  MessageSquare,
  Monitor,
  Moon,
  Search,
  Shield,
  Sun,
  User,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getApiOrigin } from "@/lib/admin-constants";

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  category: "navigation" | "action" | "search";
}

interface SearchResult {
  title: string;
  type: string;
  description: string;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const router = useRouter();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  const navigate = useCallback(
    (href: string) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  // Debounced server-side search
  useEffect(() => {
    if (!open) return;
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      const origin = getApiOrigin();
      fetch(`${origin}/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => (r.ok ? r.json() : { results: [] }))
        .then((data: { results: SearchResult[] }) => setSearchResults(data.results))
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [query, open]);

  const items = useMemo<PaletteItem[]>(
    () => [
      // Navigation
      {
        id: "home",
        label: "Home",
        icon: <Home className="h-4 w-4" />,
        action: () => navigate("/"),
        keywords: ["home", "main", "landing"],
        category: "navigation",
      },
      {
        id: "about",
        label: "About",
        description: "Skills, certifications & badges",
        icon: <User className="h-4 w-4" />,
        action: () => navigate("/about/"),
        keywords: ["about", "skills", "certifications", "badges", "bio"],
        category: "navigation",
      },
      {
        id: "experience",
        label: "Work Experience",
        description: "Career timeline & positions",
        icon: <Briefcase className="h-4 w-4" />,
        action: () => navigate("/product/"),
        keywords: ["experience", "work", "career", "jobs", "timeline", "product"],
        category: "navigation",
      },
      {
        id: "projects",
        label: "Projects",
        description: "Portfolio & open source work",
        icon: <Laptop className="h-4 w-4" />,
        action: () => navigate("/projects/"),
        keywords: ["projects", "portfolio", "github", "open source"],
        category: "navigation",
      },
      {
        id: "resume",
        label: "Resume Guide",
        description: "ATS tips & career advice",
        icon: <FileText className="h-4 w-4" />,
        action: () => navigate("/resume/"),
        keywords: ["resume", "cv", "ats", "career"],
        category: "navigation",
      },
      {
        id: "contact",
        label: "Contact",
        description: "Get in touch",
        icon: <Mail className="h-4 w-4" />,
        action: () => navigate("/contact/"),
        keywords: ["contact", "email", "message", "hire"],
        category: "navigation",
      },
      {
        id: "performance",
        label: "Performance",
        description: "Live Web Vitals & benchmarks",
        icon: <Gauge className="h-4 w-4" />,
        action: () => navigate("/performance/"),
        keywords: ["performance", "speed", "vitals", "lighthouse"],
        category: "navigation",
      },
      {
        id: "agents",
        label: "AI Agents",
        description: "Agent architecture & playground",
        icon: <Zap className="h-4 w-4" />,
        action: () => navigate("/agents/"),
        keywords: ["agents", "ai", "llm", "automation"],
        category: "navigation",
      },
      {
        id: "admin",
        label: "Admin Dashboard",
        description: "Site monitoring & management",
        icon: <Shield className="h-4 w-4" />,
        action: () => navigate("/admin/"),
        keywords: ["admin", "dashboard", "monitoring"],
        category: "navigation",
      },
      // Actions
      {
        id: "theme-dark",
        label: "Switch to Dark Mode",
        icon: <Moon className="h-4 w-4" />,
        action: () => {
          close();
          document.documentElement.classList.remove("light");
          document.documentElement.classList.add("dark");
          localStorage.setItem("theme", "dark");
        },
        keywords: ["dark", "theme", "night", "mode"],
        category: "action",
      },
      {
        id: "theme-light",
        label: "Switch to Light Mode",
        icon: <Sun className="h-4 w-4" />,
        action: () => {
          close();
          document.documentElement.classList.remove("dark");
          document.documentElement.classList.add("light");
          localStorage.setItem("theme", "light");
        },
        keywords: ["light", "theme", "day", "mode"],
        category: "action",
      },
      {
        id: "chat",
        label: "Open Chat Assistant",
        description: "Ask the AI chatbot",
        icon: <MessageSquare className="h-4 w-4" />,
        action: () => {
          close();
          const btn = document.querySelector<HTMLButtonElement>(
            '[aria-label*="chat" i], [aria-label*="Chat" i]',
          );
          btn?.click();
        },
        keywords: ["chat", "bot", "assistant", "ai", "ask"],
        category: "action",
      },
      {
        id: "accessibility",
        label: "Accessibility Settings",
        icon: <Accessibility className="h-4 w-4" />,
        action: () => {
          close();
          window.dispatchEvent(new CustomEvent("open-accessibility-panel"));
        },
        keywords: ["accessibility", "a11y", "font", "contrast"],
        category: "action",
      },
      {
        id: "retro-theme",
        label: "Retro Terminal Theme",
        description: "Secret theme — green on black CRT",
        icon: <Monitor className="h-4 w-4" />,
        action: () => {
          close();
          document.documentElement.classList.toggle("retro-terminal");
        },
        keywords: ["retro", "terminal", "crt", "green", "secret", "easter egg", "hacker"],
        category: "action",
      },
    ],
    [navigate, close],
  );

  const filtered = useMemo(() => {
    const localItems = !query.trim()
      ? items
      : items.filter(
          (item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.description?.toLowerCase().includes(query.toLowerCase()) ||
            item.keywords.some((k) => k.includes(query.toLowerCase())),
        );

    // Merge server search results as "search" category items
    const serverItems: PaletteItem[] = searchResults
      .filter((r) => !localItems.some((l) => l.label.toLowerCase() === r.title.toLowerCase()))
      .map((r) => ({
        id: `search-${r.title}`,
        label: r.title,
        description: r.description,
        icon: <Globe className="h-4 w-4" />,
        action: () => {
          close();
          // Navigate to relevant page based on type
          if (r.type === "page") {
            const slug = r.title.toLowerCase().replace(/\s+/g, "-");
            if (slug === "about-themistoklis") router.push("/about/");
            else router.push(`/${slug}/`);
          }
        },
        keywords: [],
        category: "search" as const,
      }));

    return [...localItems, ...serverItems];
  }, [items, query, searchResults, close, router]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        close();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, close]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector('[data-selected="true"]');
    selected?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    }
  };

  if (!open) return null;

  const navItems = filtered.filter((i) => i.category === "navigation");
  const actionItems = filtered.filter((i) => i.category === "action");
  const searchItems = filtered.filter((i) => i.category === "search");

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center pt-[20vh]"
      onClick={close}
      onKeyDown={(e) => { if (e.key === "Escape") close(); }}
      role="presentation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg mx-4 rounded-xl border border-cyan-400/20 bg-slate-900/95 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.1)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-cyan-400/10 px-4 py-3">
          <Search className="h-4 w-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, skills, actions..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none font-mono"
            aria-label="Search commands"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-72 overflow-y-auto py-2">
          {filtered.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-slate-500 font-mono">
              No results found
            </p>
          )}

          {navItems.length > 0 && (
            <>
              <p className="px-4 py-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                Pages
              </p>
              {navItems.map((item) => {
                const idx = filtered.indexOf(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    data-selected={idx === selectedIndex}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      idx === selectedIndex
                        ? "bg-cyan-400/10 text-cyan-300"
                        : "text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="shrink-0 text-cyan-400">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.description && (
                        <span className="ml-2 text-xs text-slate-500">
                          {item.description}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-3 w-3 shrink-0 text-slate-600" />
                  </button>
                );
              })}
            </>
          )}

          {searchItems.length > 0 && (
            <>
              <p className="px-4 py-1.5 text-[11px] font-mono uppercase tracking-wider text-cyan-500/60 mt-1">
                Search Results
              </p>
              {searchItems.map((item) => {
                const idx = filtered.indexOf(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    data-selected={idx === selectedIndex}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      idx === selectedIndex
                        ? "bg-cyan-400/10 text-cyan-300"
                        : "text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="shrink-0 text-cyan-400">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.description && (
                        <span className="ml-2 text-xs text-slate-500">
                          {item.description}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-3 w-3 shrink-0 text-slate-600" />
                  </button>
                );
              })}
            </>
          )}

          {actionItems.length > 0 && (
            <>
              <p className="px-4 py-1.5 text-[11px] font-mono uppercase tracking-wider text-slate-500 mt-1">
                Actions
              </p>
              {actionItems.map((item) => {
                const idx = filtered.indexOf(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    data-selected={idx === selectedIndex}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      idx === selectedIndex
                        ? "bg-cyan-400/10 text-cyan-300"
                        : "text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    <span className="shrink-0 text-cyan-400">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.description && (
                        <span className="ml-2 text-xs text-slate-500">
                          {item.description}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="h-3 w-3 shrink-0 text-slate-600" />
                  </button>
                );
              })}
            </>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-cyan-400/10 px-4 py-2">
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5">
                &uarr;&darr;
              </kbd>{" "}
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1 py-0.5">
                &crarr;
              </kbd>{" "}
              select
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
