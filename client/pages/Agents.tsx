import { ArrowLeft, Bot, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatedSection } from "@/components/AnimatedSection";
import { AgentBuilder } from "@/components/agents/AgentBuilder";
import TemplateCreator from "@/components/agents/TemplateCreator";
import TemplateSelector from "@/components/agents/TemplateSelector";
import { WorkflowBuilder } from "@/components/agents/WorkflowBuilder";
import CircuitBackground from "@/components/CircuitBackground";
import Navigation from "@/components/Navigation";
import type { AgentTemplate } from "@/data/agentTemplates";

type ViewMode = "select" | "create" | "configure" | "build";

export default function Agents() {
  const [viewMode, setViewMode] = useState<ViewMode>("select");
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [userTemplates, setUserTemplates] = useState<AgentTemplate[]>([]);

  const handleSelectTemplate = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setViewMode("configure");
  };

  const handleCloneTemplate = (template: AgentTemplate) => {
    setUserTemplates((prev) => [...prev, template]);
    setSelectedTemplate(template);
    setViewMode("configure");
  };

  const handleCreateTemplate = (template: AgentTemplate) => {
    setUserTemplates((prev) => [...prev, template]);
    setSelectedTemplate(template);
    setViewMode("configure");
  };

  const handleCancelCreate = () => {
    setViewMode("select");
  };

  const handleBackToSelect = () => {
    setViewMode("select");
    setSelectedTemplate(null);
  };

  const handleStartBuilding = () => {
    setViewMode("build");
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-background relative overflow-hidden'>
      {/* Circuit background */}
      <CircuitBackground />

      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <main id='main-content' className='relative z-10 min-h-screen'>
        <div className='container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 md:py-20'>
          {/* Header */}
          <div className='text-center space-y-6 mb-12'>
            <AnimatedSection>
              <div className='flex items-center justify-center gap-3 mb-4'>
                <Bot className='w-8 h-8 text-cyan-400' />
                <Sparkles className='w-6 h-6 text-cyan-400' />
              </div>
              <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold text-foreground'>
                AI Agent Builder
              </h1>
              <p className='text-foreground/70 text-lg md:text-xl max-w-3xl mx-auto'>
                Create intelligent AI agents using pre-built templates or start from scratch. Build,
                configure, and deploy agents for various tasks and workflows.
              </p>
            </AnimatedSection>

            {/* Breadcrumb/Navigation */}
            <div className='flex items-center justify-center gap-4 text-sm'>
              <Link
                to='/'
                className='text-foreground/60 hover:text-cyan-400 transition-colors flex items-center gap-2'
              >
                <ArrowLeft className='w-4 h-4' />
                Back to Home
              </Link>
              {viewMode !== "select" && (
                <>
                  <span className='text-foreground/40'>•</span>
                  <button
                    type='button'
                    onClick={handleBackToSelect}
                    className='text-cyan-400 hover:text-cyan-300 transition-colors'
                  >
                    Template Selection
                  </button>
                  {viewMode === "configure" && selectedTemplate && (
                    <>
                      <span className='text-foreground/40'>•</span>
                      <span className='text-foreground/80'>{selectedTemplate.name}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Content based on view mode */}
          {viewMode === "select" && (
            <AnimatedSection delay={0.2}>
              <TemplateSelector
                onSelectTemplate={handleSelectTemplate}
                onCloneTemplate={handleCloneTemplate}
                onCreateTemplate={() => {
                  setViewMode("create");
                }}
              />
            </AnimatedSection>
          )}

          {viewMode === "create" && (
            <AnimatedSection delay={0.2}>
              <TemplateCreator
                onCreateTemplate={handleCreateTemplate}
                onCancel={handleCancelCreate}
              />
            </AnimatedSection>
          )}

          {viewMode === "configure" && selectedTemplate && (
            <AnimatedSection delay={0.2}>
              <div className='max-w-4xl mx-auto space-y-8'>
                {/* Selected Template Summary */}
                <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8'>
                  <div className='flex items-start gap-6'>
                    <div className='text-6xl'>{selectedTemplate.icon}</div>
                    <div className='flex-1 space-y-4'>
                      <div>
                        <h2
                          className='text-3xl font-bold text-white mb-2'
                          data-testid='template-title'
                        >
                          {selectedTemplate.name}
                        </h2>
                        <p className='text-white/70 text-lg'>{selectedTemplate.description}</p>
                      </div>

                      <div className='flex flex-wrap gap-4 text-sm'>
                        <div className='flex items-center gap-2'>
                          <span className='text-white/60'>Category:</span>
                          <span className='text-cyan-400 capitalize'>
                            {selectedTemplate.category}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-white/60'>Difficulty:</span>
                          <span className='text-cyan-400 capitalize'>
                            {selectedTemplate.difficulty}
                          </span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <span className='text-white/60'>Time:</span>
                          <span className='text-cyan-400'>{selectedTemplate.estimatedTime}</span>
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <h3 className='text-white font-semibold mb-3'>Key Features:</h3>
                        <div className='flex flex-wrap gap-2'>
                          {selectedTemplate.features.map((feature) => (
                            <span
                              key={feature}
                              className='bg-cyan-400/10 text-cyan-400 px-3 py-1 rounded-full text-sm border border-cyan-400/20'
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <h3 className='text-white font-semibold mb-3'>Tags:</h3>
                        <div className='flex flex-wrap gap-2'>
                          {selectedTemplate.tags.map((tag) => (
                            <span
                              key={tag}
                              className='bg-white/10 text-white/80 px-3 py-1 rounded-full text-sm border border-white/20'
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration Actions */}
                <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8'>
                  <h3 className='text-2xl font-bold text-white mb-6'>Ready to Build Your Agent?</h3>
                  <p className='text-white/70 mb-8'>
                    This template provides a solid foundation for your AI agent. You can now
                    customize the workflow, add specific configurations, and deploy your agent to
                    start working.
                  </p>

                  <div className='flex flex-col sm:flex-row gap-4'>
                    <button
                      type='button'
                      onClick={handleStartBuilding}
                      className='flex-1 bg-cyan-400 hover:bg-cyan-500 text-black font-semibold py-4 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 flex items-center justify-center gap-3'
                    >
                      <Bot className='w-5 h-5' />
                      Start Building Agent
                    </button>
                    <button
                      type='button'
                      onClick={handleBackToSelect}
                      className='px-6 py-4 border border-white/20 text-white/80 hover:text-white hover:border-white/40 rounded-lg transition-all duration-300'
                    >
                      Choose Different Template
                    </button>
                  </div>
                </div>

                {/* Template Workflow Preview */}
                <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8'>
                  <h3 className='text-2xl font-bold text-white mb-6'>Workflow Preview</h3>
                  <WorkflowBuilder
                    nodes={selectedTemplate.workflow.nodes}
                    connections={selectedTemplate.workflow.connections}
                    readonly={true}
                  />
                </div>
              </div>
            </AnimatedSection>
          )}

          {viewMode === "build" && selectedTemplate && (
            <AnimatedSection delay={0.2}>
              <AgentBuilder
                template={selectedTemplate}
                onCancel={() => setViewMode("configure")}
                onSave={(_agent) => {
                  // TODO: Save agent to backend
                  setViewMode("select");
                }}
              />
            </AnimatedSection>
          )}

          {/* User Templates Count */}
          {userTemplates.length > 0 && viewMode === "select" && (
            <div className='text-center text-white/60 mt-8'>
              You have created {userTemplates.length} custom template
              {userTemplates.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
