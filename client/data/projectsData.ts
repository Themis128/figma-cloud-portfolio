import { useMemo } from 'react'

export interface Project3D {
  id: string
  title: string
  description: string
  technologies: string[]
  color: string
  position: [number, number, number]
  scale: number
  category: 'web' | 'mobile' | 'ai' | 'tools' | 'game'
  year: number
  image?: string
}

// Sample project position coordinates (demo data)
const SAMPLE_PROJECT_1_POSITION: [number, number, number] = [-3, 2, 0]
const SAMPLE_PROJECT_2_POSITION: [number, number, number] = [3, 1, -1]
const SAMPLE_PROJECT_3_POSITION: [number, number, number] = [0, -2, 2]
const SAMPLE_PROJECT_4_POSITION: [number, number, number] = [-2, -1, -2]
const SAMPLE_PROJECT_5_POSITION: [number, number, number] = [2, -1, 1]

/**
 * Hook to create sample project data — does NOT import any 3D library,
 * so it is safe to use in pages that lazy-load the 3D canvas.
 */
export function useSampleProjects(): Project3D[] {
  return useMemo(
    () => [
      {
        id: 'portfolio',
        title: 'Portfolio Website',
        description: 'Modern React portfolio with 3D elements',
        technologies: ['React', 'Three.js', 'TypeScript'],
        color: '#3b82f6',
        position: SAMPLE_PROJECT_1_POSITION,
        scale: 1,
        category: 'web',
        year: 2024,
        image: '/projects/portfolio-website.png',
      },
      {
        id: 'ecommerce',
        title: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution',
        technologies: ['Next.js', 'Stripe', 'PostgreSQL'],
        color: '#10b981',
        position: SAMPLE_PROJECT_2_POSITION,
        scale: 0.8,
        category: 'web',
        year: 2024,
        image: '/projects/ecommerce-platform.png',
      },
      {
        id: 'dashboard',
        title: 'Analytics Dashboard',
        description: 'Real-time data visualization dashboard',
        technologies: ['React', 'D3.js', 'WebSocket'],
        color: '#f59e0b',
        position: SAMPLE_PROJECT_3_POSITION,
        scale: 1.2,
        category: 'web',
        year: 2023,
        image: '/projects/analytics-dashboard.png',
      },
      {
        id: 'mobile-app',
        title: 'Mobile App',
        description: 'Cross-platform mobile application',
        technologies: ['React Native', 'Firebase', 'Expo'],
        color: '#ef4444',
        position: SAMPLE_PROJECT_4_POSITION,
        scale: 0.9,
        category: 'mobile',
        year: 2023,
        image: '/projects/mobile-app.png',
      },
      {
        id: 'api',
        title: 'REST API',
        description: 'Scalable REST API with authentication',
        technologies: ['Node.js', 'Express', 'JWT'],
        color: '#8b5cf6',
        position: SAMPLE_PROJECT_5_POSITION,
        scale: 0.7,
        category: 'tools',
        year: 2024,
        image: '/projects/rest-api.png',
      },
    ],
    [],
  )
}
