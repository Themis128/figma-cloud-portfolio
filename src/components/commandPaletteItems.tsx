import {
  Accessibility,
  Briefcase,
  FileText,
  Gauge,
  Home,
  Laptop,
  Mail,
  MessageSquare,
  Monitor,
  Moon,
  Sun,
  User,
  Zap,
} from "lucide-react";

export interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  category: "navigation" | "action" | "search";
}

export function buildPaletteItems(
  navigate: (path: string) => void,
  close: () => void,
): PaletteItem[] {
  return [
      // Navigation
      {
        id: "home",
        label: "Home",
        icon: <Home className="h-4 w-4" />,
        action: () => {
            navigate("/");
          },
        keywords: ["home", "main", "landing"],
        category: "navigation",
      },
      {
        id: "about",
        label: "About",
        description: "Skills, certifications & badges",
        icon: <User className="h-4 w-4" />,
        action: () => {
            navigate("/about/");
          },
        keywords: ["about", "skills", "certifications", "badges", "bio"],
        category: "navigation",
      },
      {
        id: "experience",
        label: "Work Experience",
        description: "Career timeline & positions",
        icon: <Briefcase className="h-4 w-4" />,
        action: () => {
            navigate("/product/");
          },
        keywords: ["experience", "work", "career", "jobs", "timeline", "product"],
        category: "navigation",
      },
      {
        id: "projects",
        label: "Projects",
        description: "Portfolio & open source work",
        icon: <Laptop className="h-4 w-4" />,
        action: () => {
            navigate("/projects/");
          },
        keywords: ["projects", "portfolio", "github", "open source"],
        category: "navigation",
      },
      {
        id: "resume",
        label: "Resume Guide",
        description: "ATS tips & career advice",
        icon: <FileText className="h-4 w-4" />,
        action: () => {
            navigate("/resume/");
          },
        keywords: ["resume", "cv", "ats", "career"],
        category: "navigation",
      },
      {
        id: "contact",
        label: "Contact",
        description: "Get in touch",
        icon: <Mail className="h-4 w-4" />,
        action: () => {
            navigate("/contact/");
          },
        keywords: ["contact", "email", "message", "hire"],
        category: "navigation",
      },
      {
        id: "performance",
        label: "Performance",
        description: "Live Web Vitals & benchmarks",
        icon: <Gauge className="h-4 w-4" />,
        action: () => {
            navigate("/performance/");
          },
        keywords: ["performance", "speed", "vitals", "lighthouse"],
        category: "navigation",
      },
      {
        id: "agents",
        label: "AI Agents",
        description: "Agent architecture & playground",
        icon: <Zap className="h-4 w-4" />,
        action: () => {
            navigate("/agents/");
          },
        keywords: ["agents", "ai", "llm", "automation"],
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
        description: "Secret theme: green on black CRT",
        icon: <Monitor className="h-4 w-4" />,
        action: () => {
          close();
          document.documentElement.classList.toggle("retro-terminal");
        },
        keywords: ["retro", "terminal", "crt", "green", "secret", "easter egg", "hacker"],
        category: "action",
      },
    ];
}
