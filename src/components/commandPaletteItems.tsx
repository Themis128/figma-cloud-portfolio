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
  description?: string | undefined;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
  category: "navigation" | "action" | "search";
}

export interface PaletteItemDef {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  keywords: string[];
  category: "navigation" | "action" | "search";
  href?: string;
}

export const PALETTE_ITEM_DEFS: PaletteItemDef[] = [
  // Navigation
  {
    id: "home",
    label: "Home",
    icon: <Home className="h-4 w-4" />,
    keywords: ["home", "main", "landing"],
    category: "navigation",
    href: "/",
  },
  {
    id: "about",
    label: "About",
    description: "Skills, certifications & badges",
    icon: <User className="h-4 w-4" />,
    keywords: ["about", "skills", "certifications", "badges", "bio"],
    category: "navigation",
    href: "/about/",
  },
  {
    id: "experience",
    label: "Work Experience",
    description: "Career timeline & positions",
    icon: <Briefcase className="h-4 w-4" />,
    keywords: ["experience", "work", "career", "jobs", "timeline", "product"],
    category: "navigation",
    href: "/product/",
  },
  {
    id: "projects",
    label: "Projects",
    description: "Portfolio & open source work",
    icon: <Laptop className="h-4 w-4" />,
    keywords: ["projects", "portfolio", "github", "open source"],
    category: "navigation",
    href: "/projects/",
  },
  {
    id: "resume",
    label: "Resume Guide",
    description: "ATS tips & career advice",
    icon: <FileText className="h-4 w-4" />,
    keywords: ["resume", "cv", "ats", "career"],
    category: "navigation",
    href: "/resume/",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Get in touch",
    icon: <Mail className="h-4 w-4" />,
    keywords: ["contact", "email", "message", "hire"],
    category: "navigation",
    href: "/contact/",
  },
  {
    id: "performance",
    label: "Performance",
    description: "Live Web Vitals & benchmarks",
    icon: <Gauge className="h-4 w-4" />,
    keywords: ["performance", "speed", "vitals", "lighthouse"],
    category: "navigation",
    href: "/performance/",
  },
  {
    id: "agents",
    label: "AI Agents",
    description: "Agent architecture & playground",
    icon: <Zap className="h-4 w-4" />,
    keywords: ["agents", "ai", "llm", "automation"],
    category: "navigation",
    href: "/agents/",
  },
  // Actions (dispatched by id in CommandPalette)
  {
    id: "theme-dark",
    label: "Switch to Dark Mode",
    icon: <Moon className="h-4 w-4" />,
    keywords: ["dark", "theme", "night", "mode"],
    category: "action",
  },
  {
    id: "theme-light",
    label: "Switch to Light Mode",
    icon: <Sun className="h-4 w-4" />,
    keywords: ["light", "theme", "day", "mode"],
    category: "action",
  },
  {
    id: "chat",
    label: "Open Chat Assistant",
    description: "Ask the AI chatbot",
    icon: <MessageSquare className="h-4 w-4" />,
    keywords: ["chat", "bot", "assistant", "ai", "ask"],
    category: "action",
  },
  {
    id: "accessibility",
    label: "Accessibility Settings",
    icon: <Accessibility className="h-4 w-4" />,
    keywords: ["accessibility", "a11y", "font", "contrast"],
    category: "action",
  },
  {
    id: "retro-theme",
    label: "Retro Terminal Theme",
    description: "Secret theme: green on black CRT",
    icon: <Monitor className="h-4 w-4" />,
    keywords: ["retro", "terminal", "crt", "green", "secret", "easter egg", "hacker"],
    category: "action",
  },
];
