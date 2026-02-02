import { AnimatePresence, motion } from 'framer-motion'
import { Code, ExternalLink, Filter, Github, Search } from 'lucide-react'
import React, { useDeferredValue, useMemo, useState } from 'react'
import { LinkPreview } from '@/components/LinkPreview'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  category: 'web' | 'mobile' | 'ai' | 'tools' | 'game'
  image?: string
  demoUrl?: string
  githubUrl?: string
  year: number
  featured?: boolean
}

const sampleProjects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Dashboard',
    description:
      'A comprehensive admin dashboard for e-commerce platforms with real-time analytics and inventory management.',
    technologies: ['React', 'TypeScript', 'TailwindCSS', 'Node.js', 'PostgreSQL'],
    category: 'web',
    image: '/api/placeholder/400/300',
    demoUrl: 'https://demo.example.com',
    githubUrl: 'https://github.com/example/project',
    year: 2024,
    featured: true,
  },
  {
    id: '2',
    title: 'AI Content Generator',
    description:
      'AI-powered content generation tool that creates blog posts, social media content, and marketing copy.',
    technologies: ['Next.js', 'OpenAI API', 'React Query', 'Prisma'],
    category: 'ai',
    image: '/api/placeholder/400/300',
    demoUrl: 'https://ai-demo.example.com',
    githubUrl: 'https://github.com/example/ai-project',
    year: 2024,
  },
  {
    id: '3',
    title: 'Mobile Fitness Tracker',
    description:
      'Cross-platform mobile application for tracking fitness activities, nutrition, and health metrics.',
    technologies: ['React Native', 'Expo', 'Firebase', 'Redux'],
    category: 'mobile',
    image: '/api/placeholder/400/300',
    demoUrl: 'https://fitness.example.com',
    githubUrl: 'https://github.com/example/fitness-app',
    year: 2023,
  },
  {
    id: '4',
    title: 'Code Collaboration Tool',
    description:
      'Real-time collaborative code editor with version control integration and team management features.',
    technologies: ['Vue.js', 'Socket.io', 'Express', 'MongoDB'],
    category: 'tools',
    image: '/api/placeholder/400/300',
    demoUrl: 'https://collab.example.com',
    githubUrl: 'https://github.com/example/collab-tool',
    year: 2023,
  },
  {
    id: '5',
    title: '3D Portfolio Showcase',
    description:
      'Interactive 3D portfolio website built with Three.js and React, showcasing projects in an immersive environment.',
    technologies: ['React', 'Three.js', 'GSAP', 'TailwindCSS'],
    category: 'web',
    image: '/api/placeholder/400/300',
    demoUrl: 'https://3d-portfolio.example.com',
    githubUrl: 'https://github.com/example/3d-portfolio',
    year: 2024,
    featured: true,
  },
  {
    id: '6',
    title: 'Task Management Game',
    description:
      'Gamified task management application that turns productivity into an RPG experience.',
    technologies: ['React', 'TypeScript', 'D3.js', 'Node.js'],
    category: 'game',
    image: '/api/placeholder/400/300',
    demoUrl: 'https://game.example.com',
    githubUrl: 'https://github.com/example/task-game',
    year: 2023,
  },
]

const categoryIcons = {
  web: Code,
  mobile: Code,
  ai: Code,
  tools: Code,
  game: Code,
}

const categoryColors = {
  web: 'bg-blue-100 text-blue-800',
  mobile: 'bg-green-100 text-green-800',
  ai: 'bg-purple-100 text-purple-800',
  tools: 'bg-orange-100 text-orange-800',
  game: 'bg-red-100 text-red-800',
}

interface SearchableProjectsProps {
  className?: string
}

const SearchableProjects: React.FC<SearchableProjectsProps> = ({ className }) => {
  // Animation and display constants
  const ANIMATION_STAGGER_DELAY = 0.1 // seconds
  const MAX_TECHNOLOGIES_DISPLAYED = 4

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'year' | 'title'>('year')

  // Use useDeferredValue for smooth search experience
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const filteredProjects = useMemo(() => {
    const filtered = sampleProjects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        project.technologies.some((tech) =>
          tech.toLowerCase().includes(deferredSearchQuery.toLowerCase()),
        )

      const matchesCategory = selectedCategory === 'all' || project.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    // Sort projects
    filtered.sort((a, b) => {
      if (sortBy === 'year') {
        return b.year - a.year
      } else {
        return a.title.localeCompare(b.title)
      }
    })

    return filtered
  }, [deferredSearchQuery, selectedCategory, sortBy])

  const categories = [
    { key: 'all', label: 'All Projects', count: sampleProjects.length },
    {
      key: 'web',
      label: 'Web Applications',
      count: sampleProjects.filter((p) => p.category === 'web').length,
    },
    {
      key: 'mobile',
      label: 'Mobile Apps',
      count: sampleProjects.filter((p) => p.category === 'mobile').length,
    },
    {
      key: 'ai',
      label: 'AI & ML',
      count: sampleProjects.filter((p) => p.category === 'ai').length,
    },
    {
      key: 'tools',
      label: 'Developer Tools',
      count: sampleProjects.filter((p) => p.category === 'tools').length,
    },
    {
      key: 'game',
      label: 'Games',
      count: sampleProjects.filter((p) => p.category === 'game').length,
    },
  ]

  const motionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-3'>
            <Search className='h-5 w-5 text-blue-600' />
            Find Projects
          </CardTitle>
          <CardDescription>
            Search through {sampleProjects.length} projects by title, description, or technologies
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Search Input */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search projects...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>

          {/* Filters */}
          <div className='flex flex-wrap gap-2'>
            {categories.map((category) => (
              <Badge
                key={category.key}
                variant={selectedCategory === category.key ? 'default' : 'outline'}
                className='cursor-pointer hover:bg-gray-100'
                onClick={() => setSelectedCategory(category.key)}
              >
                {category.label} ({category.count})
              </Badge>
            ))}
          </div>

          {/* Sort Options */}
          <div className='flex items-center gap-2 text-sm text-gray-600'>
            <Filter className='h-4 w-4' />
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'year' | 'title')}
              className='border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='year'>Year</option>
              <option value='title'>Title</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold'>
            {filteredProjects.length} Project{filteredProjects.length !== 1 ? 's' : ''} Found
          </h2>
          {deferredSearchQuery && (
            <p className='text-sm text-gray-600'>Showing results for "{deferredSearchQuery}"</p>
          )}
        </div>

        {/* Projects Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          <AnimatePresence mode='wait'>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial='hidden'
                animate='visible'
                exit='exit'
                variants={motionVariants}
                transition={{ duration: 0.3, delay: index * ANIMATION_STAGGER_DELAY }}
                className='h-full'
              >
                <Card className='h-full hover:shadow-lg transition-shadow duration-300'>
                  <div className='relative overflow-hidden'>
                    {project.featured && (
                      <Badge className='absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white'>
                        Featured
                      </Badge>
                    )}
                    <div className='aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center'>
                      <Code className='h-16 w-16 text-gray-400' />
                    </div>
                  </div>

                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <Badge className={categoryColors[project.category]}>
                        {React.createElement(categoryIcons[project.category], {
                          className: 'h-3 w-3 mr-1',
                        })}
                        {project.category}
                      </Badge>
                      <span className='text-sm text-gray-500'>{project.year}</span>
                    </div>
                    <CardTitle className='line-clamp-2'>{project.title}</CardTitle>
                  </CardHeader>

                  <CardContent className='space-y-4'>
                    <CardDescription className='line-clamp-3'>
                      {project.description}
                    </CardDescription>

                    <div className='flex flex-wrap gap-2'>
                      {project.technologies.slice(0, MAX_TECHNOLOGIES_DISPLAYED).map((tech) => (
                        <Badge key={tech} variant='secondary' className='text-xs'>
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > MAX_TECHNOLOGIES_DISPLAYED && (
                        <Badge variant='secondary' className='text-xs'>
                          +{project.technologies.length - MAX_TECHNOLOGIES_DISPLAYED}
                        </Badge>
                      )}
                    </div>

                    <div className='flex gap-2'>
                      {project.demoUrl && (
                        <a
                          href={project.demoUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors text-sm'
                        >
                          <ExternalLink className='h-3 w-3' />
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors text-sm'
                        >
                          <Github className='h-3 w-3' />
                          Code
                        </a>
                      )}
                    </div>

                    {/* Link Previews */}
                    {(project.demoUrl || project.githubUrl) && (
                      <div className='space-y-2 pt-2 border-t'>
                        {project.demoUrl && (
                          <LinkPreview url={project.demoUrl} compact className='text-xs' />
                        )}
                        {project.githubUrl && (
                          <LinkPreview url={project.githubUrl} compact className='text-xs' />
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className='text-center py-12'
          >
            <div className='text-gray-400 mb-4'>
              <Search className='h-16 w-16 mx-auto' />
            </div>
            <h3 className='text-lg font-semibold text-gray-600 mb-2'>No projects found</h3>
            <p className='text-gray-500'>
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default SearchableProjects
