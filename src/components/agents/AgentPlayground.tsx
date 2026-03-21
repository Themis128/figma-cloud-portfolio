"use client";

import { useState } from "react";
import { AgentBuilder } from "@/components/agents/AgentBuilder";
import TemplateCreator from "@/components/agents/TemplateCreator";
import TemplateSelector from "@/components/agents/TemplateSelector";
import type { AgentTemplate } from "@/data/agentTemplates";

type View = "select" | "create" | "build";

export default function AgentPlayground() {
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
    <div className="space-y-6">
      {view === "select" && (
        <div className="space-y-6">
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
  );
}
