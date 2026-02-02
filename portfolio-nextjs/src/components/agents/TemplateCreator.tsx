import { Plus, Save, X } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { AgentTemplate } from '@/data/agentTemplates'

interface TemplateCreatorProps {
  onCreateTemplate: (template: AgentTemplate) => void
  onCancel: () => void
}

const defaultTemplate: Omit<AgentTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
  name: '',
  description: '',
  category: 'basic',
  difficulty: 'beginner',
  icon: '🤖',
  tags: [],
  estimatedTime: '10 minutes',
  workflow: {
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        position: { x: 100, y: 100 },
        config: {},
        label: 'Input',
      },
      {
        id: 'output-1',
        type: 'output',
        position: { x: 500, y: 100 },
        config: {},
        label: 'Output',
      },
    ],
    connections: [],
  },
  features: [],
  useCases: [],
}

export default function TemplateCreator({ onCreateTemplate, onCancel }: TemplateCreatorProps) {
  const [template, setTemplate] = useState(defaultTemplate)
  const [newTag, setNewTag] = useState('')
  const [newFeature, setNewFeature] = useState('')
  const [newUseCase, setNewUseCase] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!(template.name.trim() && template.description.trim())) {
      return
    }

    const newTemplate: AgentTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    onCreateTemplate(newTemplate)
  }

  const addTag = () => {
    if (newTag.trim() && !template.tags.includes(newTag.trim())) {
      setTemplate((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTemplate((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const addFeature = () => {
    if (newFeature.trim() && !template.features.includes(newFeature.trim())) {
      setTemplate((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (featureToRemove: string) => {
    setTemplate((prev) => ({
      ...prev,
      features: prev.features.filter((feature) => feature !== featureToRemove),
    }))
  }

  const addUseCase = () => {
    if (newUseCase.trim() && !template.useCases.includes(newUseCase.trim())) {
      setTemplate((prev) => ({
        ...prev,
        useCases: [...prev.useCases, newUseCase.trim()],
      }))
      setNewUseCase('')
    }
  }

  const removeUseCase = (useCaseToRemove: string) => {
    setTemplate((prev) => ({
      ...prev,
      useCases: prev.useCases.filter((useCase) => useCase !== useCaseToRemove),
    }))
  }

  return (
    <div className='w-full max-w-2xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='text-center space-y-2'>
        <h2 className='text-3xl font-bold text-white'>Create Custom Template</h2>
        <p className='text-white/70'>Build your own AI agent template from scratch</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Basic Information */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-white'>Basic Information</h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label
                htmlFor='template-name'
                className='block text-sm font-medium text-white/90 mb-2'
              >
                Template Name *
              </label>
              <Input
                id='template-name'
                type='text'
                value={template.name}
                onChange={(e) => setTemplate((prev) => ({ ...prev, name: e.target.value }))}
                placeholder='My Custom Agent'
                className='bg-white/5 border-white/10 text-white placeholder-white/50'
                required
              />
            </div>

            <div>
              <label
                htmlFor='template-icon'
                className='block text-sm font-medium text-white/90 mb-2'
              >
                Icon
              </label>
              <Input
                id='template-icon'
                type='text'
                value={template.icon}
                onChange={(e) => setTemplate((prev) => ({ ...prev, icon: e.target.value }))}
                placeholder='🤖'
                className='bg-white/5 border-white/10 text-white placeholder-white/50'
                maxLength={2}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='template-description'
              className='block text-sm font-medium text-white/90 mb-2'
            >
              Description *
            </label>
            <Textarea
              id='template-description'
              value={template.description}
              onChange={(e) =>
                setTemplate((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder='Describe what your agent does...'
              className='bg-white/5 border-white/10 text-white placeholder-white/50 min-h-[100px]'
              required
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label
                htmlFor='template-category'
                className='block text-sm font-medium text-white/90 mb-2'
              >
                Category
              </label>
              <select
                id='template-category'
                value={template.category}
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    category: e.target.value as AgentTemplate['category'],
                  }))
                }
                className='w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400/50'
              >
                <option value='basic'>Basic</option>
                <option value='advanced'>Advanced</option>
                <option value='specialized'>Specialized</option>
              </select>
            </div>

            <div>
              <label
                htmlFor='template-difficulty'
                className='block text-sm font-medium text-white/90 mb-2'
              >
                Difficulty
              </label>
              <select
                id='template-difficulty'
                value={template.difficulty}
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    difficulty: e.target.value as AgentTemplate['difficulty'],
                  }))
                }
                className='w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-400/50'
              >
                <option value='beginner'>Beginner</option>
                <option value='intermediate'>Intermediate</option>
                <option value='advanced'>Advanced</option>
              </select>
            </div>

            <div>
              <label
                htmlFor='template-time'
                className='block text-sm font-medium text-white/90 mb-2'
              >
                Estimated Time
              </label>
              <Input
                id='template-time'
                type='text'
                value={template.estimatedTime}
                onChange={(e) =>
                  setTemplate((prev) => ({
                    ...prev,
                    estimatedTime: e.target.value,
                  }))
                }
                placeholder='10 minutes'
                className='bg-white/5 border-white/10 text-white placeholder-white/50'
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-white'>Tags</h3>

          <div className='flex gap-2'>
            <Input
              type='text'
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder='Add a tag...'
              className='bg-white/5 border-white/10 text-white placeholder-white/50'
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button
              type='button'
              onClick={addTag}
              variant='outline'
              size='sm'
              className='border-white/10 text-white/70 hover:bg-white/10'
            >
              <Plus className='w-4 h-4' />
            </Button>
          </div>

          <div className='flex flex-wrap gap-2'>
            {template.tags.map((tag) => (
              <Badge
                key={tag}
                variant='secondary'
                className='bg-white/10 text-white/80 border-white/20 flex items-center gap-1'
              >
                {tag}
                <button
                  type='button'
                  onClick={() => removeTag(tag)}
                  className='ml-1 hover:bg-white/20 rounded-full p-0.5'
                >
                  <X className='w-3 h-3' />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-white'>Features</h3>

          <div className='flex gap-2'>
            <Input
              type='text'
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder='Add a feature...'
              className='bg-white/5 border-white/10 text-white placeholder-white/50'
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addFeature()
                }
              }}
            />
            <Button
              type='button'
              onClick={addFeature}
              variant='outline'
              size='sm'
              className='border-white/10 text-white/70 hover:bg-white/10'
            >
              <Plus className='w-4 h-4' />
            </Button>
          </div>

          <ul className='space-y-2'>
            {template.features.map((feature) => (
              <li key={feature} className='flex items-center gap-2 text-white/70'>
                <div className='w-1 h-1 bg-cyan-400 rounded-full' />
                {feature}
                <button
                  type='button'
                  onClick={() => removeFeature(feature)}
                  className='ml-auto text-white/50 hover:text-white/70'
                >
                  <X className='w-4 h-4' />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Use Cases */}
        <div className='space-y-4'>
          <h3 className='text-lg font-semibold text-white'>Use Cases</h3>

          <div className='flex gap-2'>
            <Input
              type='text'
              value={newUseCase}
              onChange={(e) => setNewUseCase(e.target.value)}
              placeholder='Add a use case...'
              className='bg-white/5 border-white/10 text-white placeholder-white/50'
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addUseCase()
                }
              }}
            />
            <Button
              type='button'
              onClick={addUseCase}
              variant='outline'
              size='sm'
              className='border-white/10 text-white/70 hover:bg-white/10'
            >
              <Plus className='w-4 h-4' />
            </Button>
          </div>

          <ul className='space-y-2'>
            {template.useCases.map((useCase) => (
              <li key={useCase} className='flex items-center gap-2 text-white/70'>
                <div className='w-1 h-1 bg-cyan-400 rounded-full' />
                {useCase}
                <button
                  type='button'
                  onClick={() => removeUseCase(useCase)}
                  className='ml-auto text-white/50 hover:text-white/70'
                >
                  <X className='w-4 h-4' />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className='flex gap-4 pt-6'>
          <Button
            type='button'
            onClick={onCancel}
            variant='outline'
            className='flex-1 border-white/10 text-white/70 hover:bg-white/10'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            className='flex-1 bg-cyan-400 hover:bg-cyan-500 text-black font-medium'
            disabled={!(template.name.trim() && template.description.trim())}
          >
            <Save className='w-4 h-4 mr-2' />
            Create Template
          </Button>
        </div>
      </form>
    </div>
  )
}
