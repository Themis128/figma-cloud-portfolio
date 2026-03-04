"use client";

import { useState } from "react";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";
import { AgentBuilder } from "@/components/agents/AgentBuilder";
import TemplateSelector from "@/components/agents/TemplateSelector";
import TemplateCreator from "@/components/agents/TemplateCreator";
import type { AgentTemplate } from "@/data/agentTemplates";

type View = "select" | "create" | "build";

export default function AgentsPage() {
  const [view, setView] = useState<View>("select");
  const [selectedTemplate, setSelectedTemplate] =
    useState<AgentTemplate | null>(null);
  const [savedAgents, setSavedAgents] = useState<AgentTemplate[]>([]);

  const handleSelectTemplate = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setView("build");
  };

  const handleCloneTemplate = (cloned: AgentTemplate) => {
    setSelectedTemplate(cloned);
    setView("build");
  };

  const handleCreateTemplate = () => {
    setView("create");
  };

  const handleSaveAgent = (agent: AgentTemplate) => {
    setSavedAgents((prev) => [...prev, agent]);
    setView("select");
    setSelectedTemplate(null);
  };

  const handleCancelBuild = () => {
    setView("select");
    setSelectedTemplate(null);
  };

  const handleTemplateCreated = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setView("build");
  };

  const handleCancelCreate = () => {
    setView("select");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background relative overflow-hidden">
      <CircuitBackground />
      <Navigation />

      <main id="main-content" className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          {view === "select" && (
            <div className="space-y-8">
              {/* Page Header */}
              <div className="text-center space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground uppercase tracking-wider">
                  AI Agent Templates
                </h1>
                <div className="w-16 sm:w-24 h-1 bg-linear-to-r from-cyan-400 to-blue-500 rounded-full mx-auto" />
                <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                  Browse and configure AI agent templates for your workflows.
                  Select a pre-built template or create one from scratch.
                </p>
              </div>

              {/* Saved Agents Summary */}
              {savedAgents.length > 0 && (
                <div className="bg-foreground/5 backdrop-blur-sm rounded-xl border border-border p-4">
                  <p className="text-muted-foreground text-sm">
                    You have{" "}
                    <span className="text-cyan-400 font-semibold">
                      {savedAgents.length}
                    </span>{" "}
                    saved agent{savedAgents.length !== 1 ? "s" : ""} in this
                    session.
                  </p>
                </div>
              )}

              <TemplateSelector
                onSelectTemplate={handleSelectTemplate}
                onCloneTemplate={handleCloneTemplate}
                onCreateTemplate={handleCreateTemplate}
                {...(selectedTemplate?.id
                  ? { selectedTemplateId: selectedTemplate.id }
                  : {})}
              />
            </div>
          )}

          {view === "create" && (
            <TemplateCreator
              onCreateTemplate={handleTemplateCreated}
              onCancel={handleCancelCreate}
            />
          )}

          {view === "build" && selectedTemplate && (
            <AgentBuilder
              template={selectedTemplate}
              onSave={handleSaveAgent}
              onCancel={handleCancelBuild}
            />
          )}
        </div>
      </main>
    </div>
  );
}
