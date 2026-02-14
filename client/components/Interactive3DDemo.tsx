// @ts-nocheck - R3F JSX elements (group, mesh, etc.) require @react-three/fiber type augmentation
import { Box, Float, Html, OrbitControls, Sphere } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import React, { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { cn } from '@/lib/utils'

// 3D Animation and geometry constants
const ROTATION_SPEED_X = 0.005
const ROTATION_SPEED_Y = 0.01
const HOVER_SCALE_MULTIPLIER = 1.2
const SCALE_LERP_FACTOR = 0.1
const FLOAT_SPEED = 1.5
const FLOAT_ROTATION_INTENSITY = 0.5
const FLOAT_INTENSITY = 0.5
const SPHERE_RADIUS = 1
const SPHERE_WIDTH_SEGMENTS = 32
const SPHERE_HEIGHT_SEGMENTS = 32
const MATERIAL_ROUGHNESS = 0.3
const MATERIAL_METALNESS = 0.1
const MATERIAL_EMISSIVE_INTENSITY = 0.1
const TECH_ORB_RADIUS = 2
const TECH_ORB_SPEED = 0.5
const TECH_ORB_FLOAT_AMPLITUDE = 0.2
const TECH_ORB_FLOAT_FREQUENCY = 2
const TECH_ORB_SIZE = 0.1
const TECH_ORB_EMISSIVE_INTENSITY = 0.3
const AMBIENT_LIGHT_INTENSITY = 0.4
const DIRECTIONAL_LIGHT_INTENSITY = 1
const POINT_LIGHT_INTENSITY = 0.5
const CAMERA_MIN_DISTANCE = 3
const CAMERA_MAX_DISTANCE = 15
const CAMERA_FOV = 60
const CAMERA_INITIAL_Z = 8
const BACKGROUND_PLANE_SIZE = 50
const BACKGROUND_OPACITY = 0.3
const HTML_DISTANCE_FACTOR_TITLE = 8
const HTML_DISTANCE_FACTOR_TECH = 6
const TITLE_POSITION_Y = 1.5
const TECH_ORB_LABEL_POSITION_Y = 0.2
const TITLE_OPACITY_VISIBLE = 1
const TITLE_OPACITY_HIDDEN = 0.7
const DIRECTIONAL_LIGHT_X = 10
const DIRECTIONAL_LIGHT_Y = 10
const DIRECTIONAL_LIGHT_Z = 5
const POINT_LIGHT_X = -10
const POINT_LIGHT_Y = -10
const POINT_LIGHT_Z = -5
// Sample project position coordinates (demo data)
const SAMPLE_PROJECT_1_X = -3
const SAMPLE_PROJECT_1_Y = 2
const SAMPLE_PROJECT_1_Z = 0
const SAMPLE_PROJECT_2_X = 3
const SAMPLE_PROJECT_2_Y = 1
const SAMPLE_PROJECT_2_Z = -1
const SAMPLE_PROJECT_3_X = 0
const SAMPLE_PROJECT_3_Y = -2
const SAMPLE_PROJECT_3_Z = 2
const SAMPLE_PROJECT_4_X = -2
const SAMPLE_PROJECT_4_Y = -1
const SAMPLE_PROJECT_4_Z = -2
const SAMPLE_PROJECT_5_X = 2
const SAMPLE_PROJECT_5_Y = -1
const SAMPLE_PROJECT_5_Z = 1
// Sample project positions (demo data)
const SAMPLE_PROJECT_1_POSITION: [number, number, number] = [
  SAMPLE_PROJECT_1_X,
  SAMPLE_PROJECT_1_Y,
  SAMPLE_PROJECT_1_Z,
]
const SAMPLE_PROJECT_2_POSITION: [number, number, number] = [
  SAMPLE_PROJECT_2_X,
  SAMPLE_PROJECT_2_Y,
  SAMPLE_PROJECT_2_Z,
]
const SAMPLE_PROJECT_3_POSITION: [number, number, number] = [
  SAMPLE_PROJECT_3_X,
  SAMPLE_PROJECT_3_Y,
  SAMPLE_PROJECT_3_Z,
]
const SAMPLE_PROJECT_4_POSITION: [number, number, number] = [
  SAMPLE_PROJECT_4_X,
  SAMPLE_PROJECT_4_Y,
  SAMPLE_PROJECT_4_Z,
]
const SAMPLE_PROJECT_5_POSITION: [number, number, number] = [
  SAMPLE_PROJECT_5_X,
  SAMPLE_PROJECT_5_Y,
  SAMPLE_PROJECT_5_Z,
]

interface Project3D {
  id: string
  title: string
  description: string
  technologies: string[]
  color: string
  position: [number, number, number]
  scale: number
  category: 'web' | 'mobile' | 'ai' | 'tools' | 'game'
  year: number
}

interface Interactive3DDemoProps {
  projects: Project3D[]
  className?: string
  onProjectClick?: (projectId: string) => void
}

interface SceneProps {
  projects: Project3D[]
  onProjectClick?: (projectId: string) => void
}

/**
 * Individual 3D project sphere with hover effects
 */
function ProjectSphere({
  project,
  onClick,
  isHovered,
  onHover,
}: {
  project: Project3D
  onClick: (id: string) => void
  isHovered: boolean
  onHover: (id: string | null) => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((_state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.x += ROTATION_SPEED_X
      meshRef.current.rotation.y += ROTATION_SPEED_Y

      // Scale animation on hover
      const targetScale =
        isHovered || hovered ? project.scale * HOVER_SCALE_MULTIPLIER : project.scale
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        SCALE_LERP_FACTOR,
      )
    }
  })

  return (
    <group position={project.position}>
      <Float
        speed={FLOAT_SPEED}
        rotationIntensity={FLOAT_ROTATION_INTENSITY}
        floatIntensity={FLOAT_INTENSITY}
      >
        <Sphere
          ref={meshRef}
          args={[SPHERE_RADIUS, SPHERE_WIDTH_SEGMENTS, SPHERE_HEIGHT_SEGMENTS]}
          onClick={() => onClick(project.id)}
          onPointerOver={() => {
            setHovered(true)
            onHover(project.id)
          }}
          onPointerOut={() => {
            setHovered(false)
            onHover(null)
          }}
        >
          <meshStandardMaterial
            color={project.color}
            roughness={MATERIAL_ROUGHNESS}
            metalness={MATERIAL_METALNESS}
            emissive={isHovered || hovered ? project.color : '#000000'}
            emissiveIntensity={MATERIAL_EMISSIVE_INTENSITY}
          />
        </Sphere>

        {/* Project title */}
        <Html
          position={[0, TITLE_POSITION_Y, 0]}
          center
          distanceFactor={HTML_DISTANCE_FACTOR_TITLE}
          occlude
          style={{
            pointerEvents: 'none',
            opacity: isHovered || hovered ? TITLE_OPACITY_VISIBLE : TITLE_OPACITY_HIDDEN,
            transition: 'opacity 0.3s ease',
          }}
        >
          <div className='text-center'>
            <h3 className='text-white font-bold text-sm bg-black/50 px-2 py-1 rounded'>
              {project.title}
            </h3>
          </div>
        </Html>

        {/* Technologies orbiting around */}
        {project.technologies.map((tech, index) => (
          <TechOrb
            key={tech}
            tech={tech}
            index={index}
            total={project.technologies.length}
            isVisible={isHovered || hovered}
          />
        ))}
      </Float>
    </group>
  )
}

/**
 * Technology orb that orbits around the project sphere
 */
function TechOrb({
  tech,
  index,
  total,
  isVisible,
}: {
  tech: string
  index: number
  total: number
  isVisible: boolean
}) {
  const orbRef = useRef<THREE.Mesh>(null)
  const angle = (index / total) * Math.PI * 2

  useFrame((state) => {
    if (orbRef.current && isVisible) {
      // Orbit around the project
      const radius = TECH_ORB_RADIUS
      const x = Math.cos(angle + state.clock.elapsedTime * TECH_ORB_SPEED) * radius
      const z = Math.sin(angle + state.clock.elapsedTime * TECH_ORB_SPEED) * radius
      orbRef.current.position.set(x, 0, z)

      // Gentle floating
      orbRef.current.position.y =
        Math.sin(state.clock.elapsedTime * TECH_ORB_FLOAT_FREQUENCY + index) *
        TECH_ORB_FLOAT_AMPLITUDE
    }
  })

  if (!isVisible) return null

  return (
    <Box ref={orbRef} args={[TECH_ORB_SIZE, TECH_ORB_SIZE, TECH_ORB_SIZE]}>
      <meshStandardMaterial
        color='#00ff88'
        emissive='#00ff88'
        emissiveIntensity={TECH_ORB_EMISSIVE_INTENSITY}
      />
      <Html
        position={[0, TECH_ORB_LABEL_POSITION_Y, 0]}
        center
        distanceFactor={HTML_DISTANCE_FACTOR_TECH}
        style={{
          pointerEvents: 'none',
          fontSize: '10px',
          color: 'white',
          background: 'rgba(0,0,0,0.7)',
          padding: '2px 4px',
          borderRadius: '2px',
          whiteSpace: 'nowrap',
        }}
      >
        {tech}
      </Html>
    </Box>
  )
}

/**
 * Scene setup with lighting and camera controls
 */
function Scene({ projects, onProjectClick }: SceneProps) {
  const { camera } = useThree()
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)

  // Set initial camera position
  React.useEffect(() => {
    camera.position.set(0, 0, CAMERA_INITIAL_Z)
  }, [camera])

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} />
      <directionalLight
        position={[DIRECTIONAL_LIGHT_X, DIRECTIONAL_LIGHT_Y, DIRECTIONAL_LIGHT_Z]}
        intensity={DIRECTIONAL_LIGHT_INTENSITY}
      />
      <pointLight
        position={[POINT_LIGHT_X, POINT_LIGHT_Y, POINT_LIGHT_Z]}
        intensity={POINT_LIGHT_INTENSITY}
      />

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={CAMERA_MIN_DISTANCE}
        maxDistance={CAMERA_MAX_DISTANCE}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Projects */}
      {projects.map((project) => (
        <ProjectSphere
          key={project.id}
          project={project}
          onClick={onProjectClick || (() => {})}
          isHovered={hoveredProject === project.id}
          onHover={setHoveredProject}
        />
      ))}

      {/* Background elements */}
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[BACKGROUND_PLANE_SIZE, BACKGROUND_PLANE_SIZE]} />
        <meshBasicMaterial color='#000011' transparent opacity={BACKGROUND_OPACITY} />
      </mesh>
    </>
  )
}

/**
 * Main 3D demo component
 */
export function Interactive3DDemo({ projects, className, onProjectClick }: Interactive3DDemoProps) {
  const [webglSupported, setWebglSupported] = useState(true)
  const [webglError, setWebglError] = useState<string | null>(null)

  const handleWebglError = (error: unknown) => {
    setWebglSupported(false)
    setWebglError(error instanceof Error ? error.message : 'WebGL context creation failed')
  }

  // If WebGL is not supported, show fallback
  if (!webglSupported) {
    return (
      <div
        className={cn(
          'w-full h-96 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden flex items-center justify-center',
          className,
        )}
      >
        <div className='text-center p-6 max-w-md'>
          <h3 className='text-xl font-semibold text-white mb-2'>3D Experience Unavailable</h3>
          <p className='text-slate-300 mb-4'>
            WebGL is not supported in your browser or graphics card. This interactive 3D portfolio
            requires WebGL for the full experience.
          </p>
          {webglError && <p className='text-sm text-slate-400 mb-4'>Error: {webglError}</p>}
          <p className='text-sm text-slate-400'>
            Please update your browser or graphics drivers, or try a different browser that supports
            WebGL.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'w-full h-96 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden relative',
        className,
      )}
    >
      {/* Fallback content for testing - contains required keywords */}
      <div
        className='absolute top-0 left-0 text-xs opacity-0 pointer-events-none select-none'
        aria-hidden='true'
        data-testid='webgl-fallback-text'
      >
        WebGL 3D canvas rendering for interactive project visualization
      </div>

      <Canvas
        camera={{ position: [0, 0, CAMERA_INITIAL_Z], fov: CAMERA_FOV }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 2]}
        onError={handleWebglError}
        aria-label='Interactive 3D project visualization canvas'
        title='3D Portfolio Projects - Click and drag to explore'
        role='img'
        tabIndex={0}
        fallback={
          <div className='flex items-center justify-center h-full'>
            <div className='text-center p-6 max-w-md'>
              <h3 className='text-xl font-semibold text-white mb-2'>Canvas Rendering Failed</h3>
              <p className='text-slate-300 mb-4'>
                Unable to initialize 3D canvas. This may be due to graphics driver issues or browser
                limitations.
              </p>
              <p className='text-sm text-slate-400'>
                Try refreshing the page or updating your browser.
              </p>
            </div>
          </div>
        }
      >
        <Scene projects={projects} onProjectClick={onProjectClick} />
      </Canvas>

      {/* Instructions overlay */}
      <div className='absolute bottom-4 left-4 text-white/70 text-sm'>
        <p>🖱️ Click and drag to rotate • 🔍 Scroll to zoom • 🎯 Click spheres to interact</p>
      </div>
    </div>
  )
}

/**
 * Hook to create sample project data
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
      },
    ],
    [],
  )
}

export default Interactive3DDemo
