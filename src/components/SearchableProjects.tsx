"use client";

import { AnimatePresence, m } from "framer-motion";
import {
  Code,
  ExternalLink,
  Filter,
  Github,
  Globe,
  Lock,
  Network,
  Search,
  Server,
  Shield,
} from "lucide-react";
import Image from "next/image";
import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { trackContentClick, trackGA4, trackSearch } from "@/components/GoogleAnalytics";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  title: string;
  description: string;
  comment: string;
  technologies: string[];
  category: "web" | "infrastructure" | "ai" | "devops" | "tools";
  githubUrl?: string;
  liveUrl?: string;
  year: number;
  featured?: boolean;
  isPrivate?: boolean;
  logo: string;
}

const projects: Project[] = [
  {
    id: "figma-cloud-portfolio",
    title: "Portfolio Website",
    description:
      "Personal portfolio built with Next.js 16, deployed on AWS S3 + CloudFront with Amplify Gen 2 backend. Features AI chatbot (AWS Bedrock), PWA support, and admin dashboard.",
    comment:
      "My flagship project: a fully serverless portfolio with AI-powered chatbot, 10-tab admin dashboard, CI/CD via GitHub Actions, and Playwright E2E testing. Static export bypasses Amplify Hosting OOM limits.",
    technologies: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "AWS Bedrock",
      "Amplify Gen 2",
      "Lambda",
    ],
    category: "web",
    liveUrl: "https://www.baltzakisthemis.com",
    year: 2026,
    featured: true,
    isPrivate: true,
    logo: "/projects/logos/nextjs.svg",
  },
  {
    id: "raspberry-pi-monitoring",
    title: "Network Monitoring Stack",
    description:
      "Comprehensive monitoring solution for home/SOHO networks featuring security monitoring, network performance tracking, and infrastructure observability.",
    comment:
      "Built on a Raspberry Pi. Collects SNMP metrics from switches and APs, visualizes network health in Grafana, and alerts on anomalies. Great for learning observability in a real network environment.",
    technologies: [
      "Raspberry Pi",
      "Prometheus",
      "Grafana",
      "Docker",
      "SNMP",
    ],
    category: "infrastructure",
    year: 2025,
    featured: true,
    isPrivate: true,
    logo: "/projects/logos/grafana.svg",
  },
  {
    id: "ap-pinpoint",
    title: "AP Pinpoint",
    description:
      "Access point mapping and visualization tool for network infrastructure planning and wireless coverage analysis.",
    comment:
      "Helps map wireless AP locations onto floor plans for coverage planning. Useful for enterprise Wi-Fi site surveys and identifying dead zones before deployment.",
    technologies: ["Network Mapping", "Wireless", "Infrastructure"],
    category: "infrastructure",
    year: 2026,
    isPrivate: true,
    logo: "/projects/logos/cisco.svg",
  },
  {
    id: "llm-dev-agent",
    title: "Network Automation Lab",
    description:
      "Network automation and containerlab project for enterprise network management. Uses containerized network devices for testing and development.",
    comment:
      "Uses Containerlab to spin up virtual Cisco/Arista topologies for testing automation scripts. Integrates with Python and Ansible to simulate enterprise network changes safely before production.",
    technologies: ["Containerlab", "Network Automation", "Docker", "Python"],
    category: "infrastructure",
    year: 2025,
    isPrivate: true,
    logo: "/projects/logos/docker.svg",
  },
  {
    id: "stable-diffusion-webui",
    title: "Stable Diffusion Web UI",
    description:
      "Self-hosted Stable Diffusion web interface for AI image generation with custom models and configurations.",
    comment:
      "Fork of AUTOMATIC1111's web UI with custom model configs and optimized for local GPU inference. Used for generating project visuals and exploring generative AI capabilities.",
    technologies: ["Python", "Stable Diffusion", "PyTorch", "Gradio"],
    category: "ai",
    githubUrl: "https://github.com/Themis128/stable-diffusion-webui",
    year: 2026,
    logo: "/projects/logos/pytorch.svg",
  },
  {
    id: "telegram-web-app",
    title: "Telegram Web App",
    description:
      "Modern Telegram Web App with PWA support, featuring full MTProto API access via Telethon for messaging and automation.",
    comment:
      "Full-featured Telegram client built as a PWA. Uses Telethon for direct MTProto protocol access, enabling custom bots, message automation, and channel management from a web browser.",
    technologies: ["Python", "Telethon", "MTProto", "PWA"],
    category: "web",
    githubUrl: "https://github.com/Themis128/telegram-web-app",
    year: 2025,
    logo: "/projects/logos/telegram.svg",
  },
  {
    id: "my-portfolio-aws",
    title: "Portfolio on AWS Amplify",
    description:
      "Portfolio website deployed with AWS Amplify, featuring CI/CD pipeline, authentication, and serverless backend.",
    comment:
      "Earlier iteration of my portfolio using AWS Amplify's full hosting. Includes Cognito auth, DynamoDB data layer, and automatic deployments from GitHub pushes.",
    technologies: ["Python", "AWS Amplify", "S3", "CloudFront"],
    category: "devops",
    githubUrl: "https://github.com/Themis128/my-portfolio-aws",
    year: 2026,
    logo: "/projects/logos/aws.svg",
  },
  {
    id: "dockerlabs",
    title: "Docker Labs",
    description:
      "Collection of Docker-based lab environments for learning containerization, networking, and microservices architecture.",
    comment:
      "Hands-on lab exercises covering Docker networking, multi-container apps with Compose, volume management, and container security best practices. Built as a learning resource.",
    technologies: ["Docker", "Docker Compose", "Python", "Networking"],
    category: "devops",
    githubUrl: "https://github.com/Themis128/dockerlabs",
    year: 2025,
    logo: "/projects/logos/docker.svg",
  },
  {
    id: "matlab-nuxt-app",
    title: "MATLAB Capabilities Checker",
    description:
      "Nuxt 4 application for checking and verifying MATLAB capabilities, featuring a modern web interface for data analysis tools.",
    comment:
      "Built during my MSc in Data Analytics. Provides a web frontend for running MATLAB toolbox checks and capability verification without needing the MATLAB desktop.",
    technologies: ["Nuxt.js", "Python", "MATLAB", "Vue.js"],
    category: "tools",
    githubUrl: "https://github.com/Themis128/matlab-nuxt-app",
    year: 2025,
    logo: "/projects/logos/matlab.svg",
  },
  {
    id: "cloudless-ecommerce",
    title: "Cloudless E-Commerce",
    description:
      "Full-stack e-commerce platform with product management, cart functionality, and payment integration.",
    comment:
      "Complete e-commerce solution for cloudless.gr, featuring product catalog, shopping cart, Stripe checkout, and an admin panel for inventory management.",
    technologies: ["TypeScript", "React", "Node.js", "Stripe"],
    category: "web",
    year: 2025,
    isPrivate: true,
    logo: "/projects/logos/react.svg",
  },
  {
    id: "supabase-master",
    title: "Supabase Monorepo",
    description:
      "Monorepo for Supabase-based apps and UI, including Next.js, Tailwind, Payload CMS, and more.",
    comment:
      "Experimental monorepo exploring Supabase as a Firebase alternative. Includes auth flows, real-time subscriptions, row-level security policies, and Payload CMS integration.",
    technologies: ["TypeScript", "Supabase", "Next.js", "Tailwind CSS"],
    category: "devops",
    githubUrl: "https://github.com/Themis128/supabase-master",
    year: 2025,
    logo: "/projects/logos/supabase.svg",
  },
  {
    id: "infographics",
    title: "Data Infographics",
    description:
      "Python-based data visualization and infographic generation tool for creating professional charts and reports.",
    comment:
      "Automates the creation of publication-quality infographics from raw datasets. Uses Matplotlib and Pandas for data processing, with customizable templates for different report styles.",
    technologies: ["Python", "Matplotlib", "Pandas", "Data Viz"],
    category: "ai",
    year: 2026,
    isPrivate: true,
    logo: "/projects/logos/python.svg",
  },
];

const categoryIcons: Record<Project["category"], React.ElementType> = {
  web: Globe,
  infrastructure: Network,
  ai: Code,
  devops: Server,
  tools: Shield,
};

const categoryLabels: Record<Project["category"], string> = {
  web: "Web",
  infrastructure: "Infrastructure",
  ai: "AI / Data",
  devops: "DevOps",
  tools: "Tools",
};

interface SearchableProjectsProps {
  className?: string;
}

const SearchableProjects: React.FC<SearchableProjectsProps> = ({
  className,
}) => {
  const ANIMATION_STAGGER_DELAY = 0.1;
  const MAX_TECHNOLOGIES_DISPLAYED = 4;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"year" | "title">("year");

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const filteredProjects = useMemo(() => {
    const filtered = projects.filter((project) => {
      const matchesSearch =
        project.title
          .toLowerCase()
          .includes(deferredSearchQuery.toLowerCase()) ||
        project.description
          .toLowerCase()
          .includes(deferredSearchQuery.toLowerCase()) ||
        project.technologies.some((tech) =>
          tech.toLowerCase().includes(deferredSearchQuery.toLowerCase()),
        );

      const matchesCategory =
        selectedCategory === "all" || project.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      if (sortBy === "year") {
        return b.year - a.year;
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [deferredSearchQuery, selectedCategory, sortBy]);

  // Track search queries in GA4 (view_search_results recommended event)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (deferredSearchQuery.length >= 2) {
      trackSearch(deferredSearchQuery, filteredProjects.length);
    }
  }, [deferredSearchQuery, filteredProjects.length]);

  const categories = [
    { key: "all", label: "All Projects", count: projects.length },
    ...Object.entries(categoryLabels).map(([key, label]) => ({
      key,
      label,
      count: projects.filter((p) => p.category === key).length,
    })),
  ];

  const motionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className={`space-y-6 ${className ?? ""}`}>
      {/* Search and Filter Controls */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Search className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Find Projects</h2>
          <span className="text-white/40 text-sm font-mono">
            {projects.length} repos
          </span>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-cyan-500/40" />
          <input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => {
                setSelectedCategory(category.key);
                trackGA4("project_filter", {
                  filter_category: category.label,
                });
              }}
              className={[
                "px-3 py-1.5 rounded-lg text-xs font-mono transition-all",
                selectedCategory === category.key
                  ? "bg-cyan-500/20 border border-cyan-500/50 text-cyan-300"
                  : "bg-white/5 border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70",
              ].join(" ")}
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 text-sm text-white/40 font-mono">
          <Filter className="h-4 w-4" />
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "year" | "title")}
            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-sm text-white/70 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="year">Year</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white font-mono">
            {filteredProjects.length} Project
            {filteredProjects.length !== 1 ? "s" : ""}
          </h2>
          {deferredSearchQuery && (
            <p className="text-sm text-white/40 font-mono">
              &quot;{deferredSearchQuery}&quot;
            </p>
          )}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <m.div
                key={project.id}
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={motionVariants}
                transition={{
                  duration: 0.3,
                  delay: index * ANIMATION_STAGGER_DELAY,
                }}
                className="h-full"
              >
                <div className="h-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-cyan-500/30 transition-all duration-300 overflow-hidden flex flex-col">
                  {/* Logo Banner */}
                  <div className="flex items-center justify-center py-5 bg-white/3 border-b border-white/5">
                    <Image
                      src={project.logo}
                      alt={`${project.title} logo`}
                      width={48}
                      height={48}
                      className="opacity-80 group-hover:opacity-100 transition-opacity"
                      unoptimized
                    />
                  </div>

                  {/* Card Header */}
                  <div className="p-5 pb-0 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {React.createElement(
                          categoryIcons[project.category],
                          {
                            className: "h-4 w-4 text-cyan-400",
                          },
                        )}
                        <span className="text-[10px] uppercase tracking-wider text-cyan-400/70 font-mono">
                          {categoryLabels[project.category]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {project.isPrivate && (
                          <Lock className="h-3 w-3 text-white/30" />
                        )}
                        <span className="text-xs text-white/40 font-mono">
                          {project.year}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 leading-tight">
                      {project.title}
                    </h3>

                    {project.featured && (
                      <Badge className="mb-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono">
                        Featured
                      </Badge>
                    )}

                    <p className="text-white/50 text-xs leading-relaxed mb-2 line-clamp-2">
                      {project.description}
                    </p>

                    <p className="text-cyan-400/50 text-[11px] leading-relaxed mb-4 italic line-clamp-2">
                      {project.comment}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {project.technologies
                        .slice(0, MAX_TECHNOLOGIES_DISPLAYED)
                        .map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-white/60 font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                      {project.technologies.length >
                        MAX_TECHNOLOGIES_DISPLAYED && (
                        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-white/40 font-mono">
                          +
                          {project.technologies.length -
                            MAX_TECHNOLOGIES_DISPLAYED}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3 border-t border-white/5 flex gap-2">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackContentClick("project_demo", project.title)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-colors text-xs font-mono"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Live
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackContentClick("project_code", project.title)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 rounded-lg hover:bg-white/10 hover:text-white/80 transition-colors text-xs font-mono"
                      >
                        <Github className="h-3 w-3" />
                        Code
                      </a>
                    )}
                    {project.isPrivate && !project.liveUrl && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white/30 text-xs font-mono">
                        <Lock className="h-3 w-3" />
                        Private Repository
                      </span>
                    )}
                  </div>
                </div>
              </m.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProjects.length === 0 && (
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className="text-white/20 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-white/50 mb-2">
              No projects found
            </h3>
            <p className="text-white/30 text-sm">
              Try adjusting your search terms or filters.
            </p>
          </m.div>
        )}
      </div>
    </div>
  );
};

export default SearchableProjects;
