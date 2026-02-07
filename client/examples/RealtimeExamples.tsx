// Example usage of Enhanced Real-time Features in React 19 pages
import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { CollaborationPanel } from '../components/realtime/CollaborationComponents'
import {
  AgentCollaborationWrapper,
  RealtimeIntegration,
} from '../components/realtime/RealtimeIntegration'

// =============================================================================
// EXAMPLE: AGENTS PAGE WITH REAL-TIME COLLABORATION
// =============================================================================

export function EnhancedAgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [showRealtimePanel, setShowRealtimePanel] = useState(false)

  const agents = [
    { id: 'agent-1', name: 'Content Writer AI', status: 'active' },
    { id: 'agent-2', name: 'Code Reviewer', status: 'idle' },
    { id: 'agent-3', name: 'Data Analyzer', status: 'running' },
  ]

  const handleAgentSelect = useCallback((agentId: string) => {
    setSelectedAgent(agentId)
  }, [])

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-navy-900'>
      {/* Header with Real-time Toggle */}
      <div className='bg-white dark:bg-navy-800 shadow-sm border-b border-gray-200 dark:border-navy-700'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
              AI Agents Dashboard
            </h1>
            <button
              type='button'
              onClick={() => setShowRealtimePanel(!showRealtimePanel)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                showRealtimePanel
                  ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-navy-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-navy-600',
              )}
            >
              {showRealtimePanel ? 'Hide' : 'Show'} Real-time Panel
            </button>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Agents List */}
          <div className='lg:col-span-1'>
            <div className='bg-white dark:bg-navy-800 rounded-lg shadow-sm border border-gray-200 dark:border-navy-700'>
              <div className='p-4 border-b border-gray-200 dark:border-navy-700'>
                <h2 className='font-semibold text-gray-900 dark:text-white'>Available Agents</h2>
              </div>
              <div className='p-4 space-y-2'>
                {agents.map((agent) => (
                  <button
                    type='button'
                    key={agent.id}
                    onClick={() => handleAgentSelect(agent.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg transition-colors',
                      selectedAgent === agent.id
                        ? 'bg-cyan-50 border-cyan-200 text-cyan-900 dark:bg-cyan-900/20 dark:border-cyan-700 dark:text-cyan-100'
                        : 'hover:bg-gray-50 dark:hover:bg-navy-750 border-transparent',
                    )}
                  >
                    <div className='flex items-center justify-between'>
                      <span className='font-medium'>{agent.name}</span>
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          agent.status === 'active' && 'bg-green-500',
                          agent.status === 'idle' && 'bg-yellow-500',
                          agent.status === 'running' && 'bg-blue-500 animate-pulse',
                        )}
                      />
                    </div>
                    <div className='text-sm text-gray-600 dark:text-gray-400 capitalize'>
                      {agent.status}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Collaboration Panel for Selected Agent */}
            {selectedAgent && (
              <div className='mt-6'>
                <CollaborationPanel
                  roomId={`agent:${selectedAgent}`}
                  title='Agent Collaboration'
                  showActivityFeed
                />
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div
            className={cn(
              'transition-all duration-200',
              showRealtimePanel ? 'lg:col-span-2' : 'lg:col-span-3',
            )}
          >
            {selectedAgent ? (
              <AgentCollaborationWrapper agentId={selectedAgent}>
                <AgentBuilder agentId={selectedAgent} />
              </AgentCollaborationWrapper>
            ) : (
              <div className='bg-white dark:bg-navy-800 rounded-lg shadow-sm border border-gray-200 dark:border-navy-700 p-8'>
                <div className='text-center'>
                  <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-2'>
                    Select an Agent
                  </h3>
                  <p className='text-gray-600 dark:text-gray-400'>
                    Choose an agent from the list to start collaborating in real-time
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Panel */}
          {showRealtimePanel && (
            <div className='lg:col-span-1'>
              <RealtimeIntegration
                userId='current-user' // Replace with actual user ID
                username='John Doe' // Replace with actual username
                showDashboard={false} // Use compact mode in sidebar
                showCollaboration={true}
                showNotifications={true}
                className='sticky top-4'
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// EXAMPLE: AGENT BUILDER COMPONENT WITH REAL-TIME FEATURES
// =============================================================================

interface AgentBuilderProps {
  agentId: string
}

function AgentBuilder({ agentId: _agentId }: AgentBuilderProps) {
  const [agentConfig, setAgentConfig] = useState({
    name: '',
    description: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
    systemPrompt: '',
    tools: [] as string[],
  })

  const [isDeploying, setIsDeploying] = useState(false)

  const handleConfigChange = useCallback((field: string, value: unknown) => {
    setAgentConfig((prev) => ({ ...prev, [field]: value }))

    // Broadcast change to collaborators would happen here
    // This is automatically handled by the AgentCollaborationWrapper
  }, [])

  const handleDeploy = useCallback(async () => {
    setIsDeploying(true)

    try {
      // Simulate deployment
      const DEPLOYMENT_DELAY = 2000
      await new Promise((resolve) => setTimeout(resolve, DEPLOYMENT_DELAY))
    } catch (_error) {
    } finally {
      setIsDeploying(false)
    }
  }, [])

  return (
    <div className='bg-white dark:bg-navy-800 rounded-lg shadow-sm border border-gray-200 dark:border-navy-700'>
      <div className='p-6'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Agent Builder</h2>
          <button
            type='button'
            onClick={handleDeploy}
            disabled={isDeploying}
            className={cn(
              'px-4 py-2 rounded-lg font-medium transition-colors',
              isDeploying
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-cyan-600 text-white hover:bg-cyan-700',
            )}
          >
            {isDeploying ? 'Deploying...' : 'Deploy Agent'}
          </button>
        </div>

        <div className='space-y-6'>
          {/* Basic Configuration */}
          <div>
            <label
              htmlFor='agent-name'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
            >
              Agent Name
            </label>
            <input
              id='agent-name'
              type='text'
              value={agentConfig.name}
              onChange={(e) => handleConfigChange('name', e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-navy-700 dark:text-white'
              placeholder='Enter agent name...'
            />
          </div>

          <div>
            <label
              htmlFor='agent-description'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
            >
              Description
            </label>
            <textarea
              id='agent-description'
              value={agentConfig.description}
              onChange={(e) => handleConfigChange('description', e.target.value)}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-navy-700 dark:text-white'
              placeholder='Describe what this agent does...'
            />
          </div>

          {/* Model Configuration */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='agent-model'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Model
              </label>
              <select
                id='agent-model'
                value={agentConfig.model}
                onChange={(e) => handleConfigChange('model', e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-navy-700 dark:text-white'
              >
                <option value='gpt-4'>GPT-4</option>
                <option value='gpt-3.5-turbo'>GPT-3.5 Turbo</option>
                <option value='claude-3'>Claude 3</option>
              </select>
            </div>

            <div>
              <label
                htmlFor='agent-temperature'
                className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
              >
                Temperature: {agentConfig.temperature}
              </label>
              <input
                id='agent-temperature'
                type='range'
                min='0'
                max='1'
                step='0.1'
                value={agentConfig.temperature}
                onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                className='w-full'
              />
            </div>
          </div>

          {/* System Prompt */}
          <div>
            <label
              htmlFor='agent-system-prompt'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
            >
              System Prompt
            </label>
            <textarea
              id='agent-system-prompt'
              value={agentConfig.systemPrompt}
              onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
              rows={6}
              className='w-full px-3 py-2 border border-gray-300 dark:border-navy-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-navy-700 dark:text-white font-mono text-sm'
              placeholder='Enter the system prompt for your agent...'
            />
          </div>

          {/* Tools Selection */}
          <div>
            <label
              htmlFor='agent-tools'
              className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'
            >
              Available Tools
            </label>
            <div id='agent-tools' className='grid grid-cols-2 md:grid-cols-3 gap-2'>
              {[
                'web_search',
                'code_execution',
                'file_system',
                'api_calls',
                'data_analysis',
                'image_generation',
              ].map((tool) => (
                <label
                  key={tool}
                  className='flex items-center space-x-2 p-2 border border-gray-200 dark:border-navy-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-navy-750'
                >
                  <input
                    type='checkbox'
                    checked={agentConfig.tools.includes(tool)}
                    onChange={(e) => {
                      const newTools = e.target.checked
                        ? [...agentConfig.tools, tool]
                        : agentConfig.tools.filter((t) => t !== tool)
                      handleConfigChange('tools', newTools)
                    }}
                    className='rounded border-gray-300 text-cyan-600 focus:ring-cyan-500'
                  />
                  <span className='text-sm text-gray-700 dark:text-gray-300 capitalize'>
                    {tool.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// EXAMPLE: PROJECTS PAGE WITH REAL-TIME UPDATES
// =============================================================================

export function EnhancedProjectsPage() {
  const [projects] = useState([
    {
      id: 'proj-1',
      title: 'Portfolio Website',
      status: 'In Progress',
      collaborators: 3,
    },
    {
      id: 'proj-2',
      title: 'AI Chat Bot',
      status: 'Planning',
      collaborators: 1,
    },
    {
      id: 'proj-3',
      title: 'E-commerce Platform',
      status: 'Completed',
      collaborators: 5,
    },
  ])

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-navy-900'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Real-time Integration at the top */}
        <div className='mb-8'>
          <RealtimeIntegration userId='current-user' username='John Doe' showDashboard compact />
        </div>

        {/* Projects Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {projects.map((project) => (
            <div
              key={project.id}
              className='bg-white dark:bg-navy-800 rounded-lg shadow-sm border border-gray-200 dark:border-navy-700 p-6'
            >
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  {project.title}
                </h3>
                <CollaborationPanel
                  roomId={`project:${project.id}`}
                  title=''
                  showActivityFeed={false}
                  className='w-auto'
                />
              </div>

              <p className='text-gray-600 dark:text-gray-400 mb-4'>
                Status: <span className='font-medium'>{project.status}</span>
              </p>

              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-500 dark:text-gray-400'>
                  {project.collaborators} collaborators
                </span>
                <button
                  type='button'
                  className='text-cyan-600 hover:text-cyan-700 font-medium text-sm'
                >
                  View Project →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default {
  EnhancedAgentsPage,
  EnhancedProjectsPage,
  AgentBuilder,
}
