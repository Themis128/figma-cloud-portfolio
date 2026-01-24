import { ArrowLeft, Play, Save, Settings } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AgentConnection, AgentNode, AgentTemplate } from "@/data/agentTemplates";
import { WorkflowBuilder } from "./WorkflowBuilder";

interface AgentBuilderProps {
  template: AgentTemplate;
  onSave: (agent: AgentTemplate) => void;
  onCancel: () => void;
}

export function AgentBuilder({ template, onSave, onCancel }: AgentBuilderProps) {
  const [agent, setAgent] = useState<AgentTemplate>({ ...template, id: `agent-${Date.now()}` });
  const [isRunning, setIsRunning] = useState(false);

  const handleWorkflowUpdate = (nodes: AgentNode[], connections: AgentConnection[]) => {
    setAgent((prev) => ({
      ...prev,
      workflow: { nodes, connections },
    }));
  };

  const handleSave = () => {
    onSave(agent);
  };

  const handleRunAgent = async () => {
    setIsRunning(true);
    // Simulate agent execution
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRunning(false);
    // TODO: Implement actual agent execution logic
    console.log("Running agent:", agent.name);
  };

  return (
    <div className='max-w-7xl mx-auto space-y-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <button
            type='button'
            onClick={onCancel}
            className='flex items-center gap-2 text-white/60 hover:text-white transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
            Back to Template
          </button>
          <div className='text-2xl'>{agent.icon}</div>
          <div>
            <h1 className='text-3xl font-bold text-white'>{agent.name}</h1>
            <p className='text-white/60'>Building your AI agent</p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <Button
            onClick={handleRunAgent}
            disabled={isRunning}
            className='bg-green-600 hover:bg-green-700 text-white'
          >
            {isRunning ? (
              <>
                <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2' />
                Running...
              </>
            ) : (
              <>
                <Play className='w-4 h-4 mr-2' />
                Test Agent
              </>
            )}
          </Button>
          <Button onClick={handleSave} className='bg-cyan-600 hover:bg-cyan-700 text-white'>
            <Save className='w-4 h-4 mr-2' />
            Save Agent
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Workflow Builder */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6'>
            <h2 className='text-xl font-semibold text-white mb-4 flex items-center gap-2'>
              <Settings className='w-5 h-5' />
              Workflow Builder
            </h2>
            <WorkflowBuilder
              nodes={agent.workflow.nodes}
              connections={agent.workflow.connections}
              onUpdate={handleWorkflowUpdate}
              readonly={false}
            />
          </div>
        </div>

        {/* Configuration Panel */}
        <div className='space-y-6'>
          {/* Agent Configuration */}
          <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6'>
            <h3 className='text-lg font-semibold text-white mb-4'>Agent Configuration</h3>
            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='agent-name'
                  className='block text-sm font-medium text-white/80 mb-2'
                >
                  Agent Name
                </label>
                <Input
                  id='agent-name'
                  value={agent.name}
                  onChange={(e) => setAgent((prev) => ({ ...prev, name: e.target.value }))}
                  className='bg-white/10 border-white/20 text-white'
                />
              </div>

              <div>
                <label
                  htmlFor='agent-description'
                  className='block text-sm font-medium text-white/80 mb-2'
                >
                  Description
                </label>
                <Textarea
                  id='agent-description'
                  value={agent.description}
                  onChange={(e) => setAgent((prev) => ({ ...prev, description: e.target.value }))}
                  className='bg-white/10 border-white/20 text-white'
                  rows={3}
                />
              </div>

              <div>
                <label
                  htmlFor='agent-category'
                  className='block text-sm font-medium text-white/80 mb-2'
                >
                  Category
                </label>
                <select
                  id='agent-category'
                  value={agent.category}
                  onChange={(e) =>
                    setAgent((prev) => ({
                      ...prev,
                      category: e.target.value as AgentTemplate["category"],
                    }))
                  }
                  className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400'
                >
                  <option value='basic'>Basic</option>
                  <option value='advanced'>Advanced</option>
                  <option value='specialized'>Specialized</option>
                </select>
              </div>
            </div>
          </div>

          {/* Agent Stats */}
          <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6'>
            <h3 className='text-lg font-semibold text-white mb-4'>Agent Stats</h3>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-white/60'>Nodes</span>
                <Badge variant='secondary'>{agent.workflow.nodes.length}</Badge>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-white/60'>Connections</span>
                <Badge variant='secondary'>{agent.workflow.connections.length}</Badge>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-white/60'>Features</span>
                <Badge variant='secondary'>{agent.features.length}</Badge>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-white/60'>Difficulty</span>
                <Badge variant='secondary' className='capitalize'>
                  {agent.difficulty}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className='bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6'>
            <h3 className='text-lg font-semibold text-white mb-4'>Quick Actions</h3>
            <div className='space-y-2'>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start'
                onClick={() => {
                  // TODO: Implement export functionality
                  console.log("Exporting agent configuration...");
                }}
              >
                Export Configuration
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start'
                onClick={() => {
                  // TODO: Implement duplicate functionality
                  console.log("Duplicating agent...");
                }}
              >
                Duplicate Agent
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='w-full justify-start text-red-400 hover:text-red-300'
                onClick={() => {
                  // TODO: Implement delete functionality
                  console.log("Deleting agent...");
                }}
              >
                Delete Agent
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
