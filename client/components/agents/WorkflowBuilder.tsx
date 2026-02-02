import { useRef, useState } from 'react'

import type { AgentConnection, AgentNode } from '@/data/agentTemplates'

// Workflow builder constants
const NODE_WIDTH = 240
const NODE_HEIGHT = 80
const NODE_WIDTH_HALF = NODE_WIDTH / 2
const NODE_HEIGHT_HALF = NODE_HEIGHT / 2
const NODE_LABEL_OFFSET_Y = 25
const NODE_TYPE_OFFSET_Y = 50

interface WorkflowBuilderProps {
  nodes: AgentNode[]
  connections: AgentConnection[]
  onUpdate?: (nodes: AgentNode[], connections: AgentConnection[]) => void
  readonly?: boolean
}

interface NodePosition {
  x: number
  y: number
}

export function WorkflowBuilder({
  nodes,
  connections,
  onUpdate,
  readonly = false,
}: WorkflowBuilderProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<NodePosition>({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  const handleNodeClick = (nodeId: string) => {
    if (readonly) return
    setSelectedNode(nodeId)
  }

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (readonly) return
    setDraggingNode(nodeId)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNode || readonly) return

    const svgRect = svgRef.current?.getBoundingClientRect()
    if (!svgRect) return

    const newX = e.clientX - svgRect.left - dragOffset.x
    const newY = e.clientY - svgRect.top - dragOffset.y

    const updatedNodes = nodes.map((node) =>
      node.id === draggingNode
        ? { ...node, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
        : node,
    )

    onUpdate?.(updatedNodes, connections)
  }

  const handleMouseUp = () => {
    setDraggingNode(null)
  }

  const getNodeColor = (type: AgentNode['type']) => {
    switch (type) {
      case 'input':
        return '#10b981' // green
      case 'output':
        return '#ef4444' // red
      case 'llm':
        return '#3b82f6' // blue
      case 'decision':
        return '#f59e0b' // amber
      case 'data-processor':
        return '#8b5cf6' // purple
      case 'tool':
        return '#06b6d4' // cyan
      default:
        return '#6b7280' // gray
    }
  }

  const getConnectionPath = (sourceId: string, targetId: string) => {
    const sourceNode = nodes.find((n) => n.id === sourceId)
    const targetNode = nodes.find((n) => n.id === targetId)

    if (!(sourceNode && targetNode)) return ''

    const sourceX = sourceNode.position.x + NODE_WIDTH_HALF // node width / 2
    const sourceY = sourceNode.position.y + NODE_HEIGHT_HALF // node height / 2
    const targetX = targetNode.position.x + NODE_WIDTH_HALF
    const targetY = targetNode.position.y + NODE_HEIGHT_HALF

    // Create a curved path
    const midX = (sourceX + targetX) / 2
    return `M ${sourceX} ${sourceY} Q ${midX} ${sourceY} ${midX} ${(sourceY + targetY) / 2} Q ${midX} ${targetY} ${targetX} ${targetY}`
  }

  return (
    <div className='relative w-full h-96 bg-black/20 rounded-lg border border-white/10 overflow-hidden'>
      <svg
        ref={svgRef}
        className='w-full h-full cursor-move'
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        role='img'
        aria-label='Workflow visualization'
      >
        {/* Connections */}
        {connections.map((connection) => (
          <path
            key={connection.id}
            d={getConnectionPath(connection.source, connection.target)}
            stroke='#60a5fa'
            strokeWidth='2'
            fill='none'
            markerEnd='url(#arrowhead)'
          />
        ))}

        {/* Arrow marker */}
        <defs>
          <marker
            id='arrowhead'
            markerWidth='10'
            markerHeight='7'
            refX='9'
            refY='3.5'
            orient='auto'
          >
            <polygon points='0 0, 10 3.5, 0 7' fill='#60a5fa' />
          </marker>
        </defs>

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            {/* Node rectangle */}
            {/* biome-ignore lint/a11y/useSemanticElements: SVG rect elements need role for accessibility */}
            <rect
              x={node.position.x}
              y={node.position.y}
              width='240'
              height='80'
              rx='8'
              fill={getNodeColor(node.type)}
              stroke={selectedNode === node.id ? '#fbbf24' : '#374151'}
              strokeWidth={selectedNode === node.id ? '3' : '1'}
              className={`${readonly ? 'cursor-default' : 'cursor-move hover:stroke-cyan-400'}`}
              onClick={() => handleNodeClick(node.id)}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              role='button'
              tabIndex={0}
              aria-label={`${node.label} - ${node.type} node`}
            />

            {/* Node label */}
            <text
              x={node.position.x + NODE_WIDTH_HALF}
              y={node.position.y + NODE_LABEL_OFFSET_Y}
              textAnchor='middle'
              fill='white'
              fontSize='12'
              fontWeight='bold'
              className='pointer-events-none'
            >
              {node.label}
            </text>

            {/* Node type */}
            <text
              x={node.position.x + NODE_WIDTH_HALF}
              y={node.position.y + NODE_TYPE_OFFSET_Y}
              textAnchor='middle'
              fill='white'
              fontSize='10'
              opacity='0.8'
              className='pointer-events-none'
            >
              {node.type.replace('-', ' ').toUpperCase()}
            </text>
          </g>
        ))}
      </svg>

      {/* Node info panel */}
      {selectedNode && (
        <div className='absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 max-w-xs'>
          <h4 className='text-white font-semibold mb-2'>Node Details</h4>
          {(() => {
            const node = nodes.find((n) => n.id === selectedNode)
            if (!node) return null
            return (
              <div className='space-y-2 text-sm'>
                <p>
                  <span className='text-white/60'>Type:</span> {node.type}
                </p>
                <p>
                  <span className='text-white/60'>Label:</span> {node.label}
                </p>
                {Object.keys(node.config).length > 0 && (
                  <div>
                    <p className='text-white/60 mb-1'>Config:</p>
                    <pre className='text-xs bg-black/20 p-2 rounded text-white/80 overflow-x-auto'>
                      {JSON.stringify(node.config, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* Instructions */}
      <div className='absolute bottom-4 left-4 text-white/60 text-sm'>
        {readonly
          ? 'View-only mode - workflow visualization'
          : 'Click nodes to select • Drag to reposition'}
      </div>
    </div>
  )
}
