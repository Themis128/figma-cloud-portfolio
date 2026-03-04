import { Clock, Search, Star, Target, Wrench, Zap } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { HoverCard } from "@/components/ui/hover-card";
import {
  type AgentTemplate,
  agentTemplates,
  cloneTemplate,
  getTemplatesByCategory,
  searchTemplates,
} from "@/data/agentTemplates";

const MAX_DISPLAYED_TAGS = 3;
const MAX_DISPLAYED_FEATURES = 2;

interface TemplateSelectorProps {
  onSelectTemplate: (template: AgentTemplate) => void;
  onCloneTemplate?: (template: AgentTemplate) => void;
  onCreateTemplate?: () => void;
  selectedTemplateId?: string;
}

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
};

const categoryIcons = {
  basic: Star,
  advanced: Zap,
  specialized: Target,
};

export default function TemplateSelector({
  onSelectTemplate,
  onCloneTemplate,
  onCreateTemplate,
  selectedTemplateId,
}: TemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    AgentTemplate["category"] | "all"
  >("all");

  const filteredTemplates = searchQuery
    ? searchTemplates(searchQuery)
    : selectedCategory === "all"
      ? agentTemplates
      : getTemplatesByCategory(selectedCategory);

  const categories = [
    {
      id: "all" as const,
      label: "All Templates",
      count: agentTemplates.length,
    },
    {
      id: "basic" as const,
      label: "Basic",
      count: getTemplatesByCategory("basic").length,
    },
    {
      id: "advanced" as const,
      label: "Advanced",
      count: getTemplatesByCategory("advanced").length,
    },
    {
      id: "specialized" as const,
      label: "Specialized",
      count: getTemplatesByCategory("specialized").length,
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">
          Choose Your AI Agent Template
        </h2>
        <p className="text-muted-foreground">
          Select from pre-built templates or start with a blank canvas
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full pl-12 pr-4 py-3 bg-foreground/5 backdrop-blur-sm border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-400/50 transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => {
            const IconComponent =
              category.id !== "all" ? categoryIcons[category.id] || Star : Star;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(category.id);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                  selectedCategory === category.id
                    ? "border-cyan-400 bg-cyan-400/10 text-cyan-400"
                    : "border-border bg-foreground/5 text-muted-foreground hover:border-cyan-400/50 hover:text-cyan-400"
                }`}
              >
                {category.id !== "all" && <IconComponent className="w-4 h-4" />}
                <span className="text-sm font-medium">{category.label}</span>
                <span className="text-xs bg-foreground/10 px-2 py-0.5 rounded-full">
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Create Custom Template Button */}
        {onCreateTemplate && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onCreateTemplate}
              className="flex items-center gap-3 px-6 py-3 bg-cyan-400 hover:bg-cyan-500 text-black font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Custom Template
            </button>
          </div>
        )}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const IconComponent = categoryIcons[template.category] || Star;
          return (
            <div key={template.id} className="relative">
              {/* Clone Button - Positioned outside the main button */}
              {onCloneTemplate && (
                <button
                  type="button"
                  onClick={() => {
                    onCloneTemplate(cloneTemplate(template));
                  }}
                  className="absolute top-4 right-4 z-10 w-8 h-8 bg-foreground/10 hover:bg-foreground/20 rounded-full flex items-center justify-center transition-colors group"
                  title="Clone template"
                  aria-label={`Clone ${template.name} template`}
                >
                  <svg
                    className="w-4 h-4 text-muted-foreground group-hover:text-foreground/90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              )}

              <HoverCard>
                <button
                  type="button"
                  className={`relative p-6 bg-foreground/5 backdrop-blur-sm rounded-xl border transition-all duration-300 cursor-pointer w-full text-left ${
                    selectedTemplateId === template.id
                      ? "border-cyan-400 bg-foreground/10"
                      : "border-border hover:border-cyan-400/50"
                  }`}
                  onClick={() => {
                    onSelectTemplate(template);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectTemplate(template);
                    }
                  }}
                >
                  {/* Selected Indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {selectedTemplateId === template.id && (
                      <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-background rounded-full" />
                      </div>
                    )}
                  </div>

                  {/* Icon and Category */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{template.icon}</div>
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      <span className="text-xs text-muted-foreground capitalize">
                        {template.category}
                      </span>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {template.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, MAX_DISPLAYED_TAGS).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs bg-foreground/10 text-foreground/80 border-border"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > MAX_DISPLAYED_TAGS && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-foreground/10 text-foreground/80 border-border"
                      >
                        +{template.tags.length - MAX_DISPLAYED_TAGS}
                      </Badge>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-2 mb-4">
                    <h4 className="text-sm font-medium text-foreground/90">
                      Key Features:
                    </h4>
                    <ul className="space-y-1">
                      {template.features
                        .slice(0, MAX_DISPLAYED_FEATURES)
                        .map((feature, featureIndex) => (
                          <li
                            key={`${template.id}-feature-${featureIndex}`}
                            className="text-xs text-muted-foreground flex items-center gap-2"
                          >
                            <div className="w-1 h-1 bg-cyan-400 rounded-full" />
                            {feature}
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {template.estimatedTime}
                      </span>
                    </div>
                    <Badge
                      className={`text-xs border ${difficultyColors[template.difficulty]}`}
                    >
                      {template.difficulty}
                    </Badge>
                  </div>
                </button>
              </HoverCard>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No templates found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Template Count */}
      <div className="text-center text-muted-foreground text-sm">
        Showing {filteredTemplates.length} of {agentTemplates.length} templates
      </div>
    </div>
  );
}
