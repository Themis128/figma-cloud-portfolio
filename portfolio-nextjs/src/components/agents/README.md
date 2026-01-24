# AI Agent Templates System

A comprehensive template system for creating and managing AI agent configurations.

## Features

### ✅ Template Selection

- Browse pre-built templates by category (Basic, Advanced, Specialized)
- Search templates by name, description, or tags
- Filter by difficulty level
- Visual template cards with key features and metadata

### ✅ Template Cloning

- Clone any existing template as a starting point
- Automatically generates unique IDs and timestamps
- Deep clones workflow nodes and connections
- Preserves all template metadata

### ✅ Custom Template Creation

- Create templates from scratch
- Comprehensive form with validation
- Add custom features, use cases, and tags
- Support for all template metadata fields

## Components

### `TemplateSelector`

Main component for browsing and selecting templates.

```tsx
import TemplateSelector from '@/components/agents/TemplateSelector'
;<TemplateSelector
  onSelectTemplate={(template) => console.log('Selected:', template)}
  onCloneTemplate={(template) => console.log('Cloned:', template)}
  selectedTemplateId="basic-chatbot"
/>
```

**Props:**

- `onSelectTemplate`: Callback when a template is selected
- `onCloneTemplate?`: Optional callback when a template is cloned
- `selectedTemplateId?`: ID of currently selected template

### `TemplateCreator`

Component for creating custom templates.

```tsx
import TemplateCreator from '@/components/agents/TemplateCreator'
;<TemplateCreator
  onCreateTemplate={(template) => console.log('Created:', template)}
  onCancel={() => console.log('Cancelled')}
/>
```

**Props:**

- `onCreateTemplate`: Callback when template is created
- `onCancel`: Callback when creation is cancelled

## Data Structure

### `AgentTemplate`

```typescript
interface AgentTemplate {
  id: string
  name: string
  description: string
  category: 'basic' | 'advanced' | 'specialized'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: string
  tags: string[]
  estimatedTime: string
  workflow: {
    nodes: AgentNode[]
    connections: AgentConnection[]
  }
  features: string[]
  useCases: string[]
  createdAt: string
  updatedAt: string
}
```

## Utility Functions

### `cloneTemplate(template, newName?)`

Creates a deep copy of a template with new IDs.

```typescript
import { cloneTemplate } from '@/data/agentTemplates'

const cloned = cloneTemplate(originalTemplate, 'My Custom Copy')
```

### `searchTemplates(query)`

Search templates by text query.

```typescript
import { searchTemplates } from '@/data/agentTemplates'

const results = searchTemplates('chatbot')
```

### `getTemplatesByCategory(category)`

Filter templates by category.

```typescript
import { getTemplatesByCategory } from '@/data/agentTemplates'

const basicTemplates = getTemplatesByCategory('basic')
```

## Usage Example

```tsx
import { useState } from 'react'
import TemplateSelector from '@/components/agents/TemplateSelector'
import TemplateCreator from '@/components/agents/TemplateCreator'
import type { AgentTemplate } from '@/data/agentTemplates'

function AgentBuilder() {
  const [view, setView] = useState<'select' | 'create'>('select')
  const [selectedTemplate, setSelectedTemplate] =
    useState<AgentTemplate | null>(null)

  if (view === 'create') {
    return (
      <TemplateCreator
        onCreateTemplate={(template) => {
          setSelectedTemplate(template)
          setView('select')
        }}
        onCancel={() => setView('select')}
      />
    )
  }

  return (
    <div>
      <button onClick={() => setView('create')}>Create Custom Template</button>

      <TemplateSelector
        onSelectTemplate={setSelectedTemplate}
        onCloneTemplate={(template) => {
          // Handle cloned template
          setSelectedTemplate(template)
        }}
        selectedTemplateId={selectedTemplate?.id}
      />

      {selectedTemplate && (
        <div>
          <h2>Selected: {selectedTemplate.name}</h2>
          <p>{selectedTemplate.description}</p>
        </div>
      )}
    </div>
  )
}
```

## Pre-built Templates

The system includes 5 pre-built templates:

1. **Basic Chatbot** - Simple conversational AI
2. **Code Reviewer** - Automated code analysis and feedback
3. **Data Analyzer** - Intelligent data processing and insights
4. **Content Writer** - AI-powered content creation
5. **Task Automator** - Workflow automation and task management

## Integration

To integrate the template system into your application:

1. Import the components
2. Handle template selection/cloning/creation callbacks
3. Store user-created templates (localStorage, database, etc.)
4. Connect to your agent builder workflow

The system is designed to be modular and can be easily extended with additional template categories, custom fields, and integration points.
