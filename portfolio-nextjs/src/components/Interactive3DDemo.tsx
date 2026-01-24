// @ts-nocheck

import { Box, Float, Html, OrbitControls, Sphere } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface Project3D {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  color: string;
  position: [number, number, number];
  scale: number;
}

interface Interactive3DDemoProps {
  projects: Project3D[];
  className?: string;
  onProjectClick?: (projectId: string) => void;
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
  project: Project3D;
  onClick: (id: string) => void;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.x += 0.005;
      meshRef.current.rotation.y += 0.01;

      // Scale animation on hover
      const targetScale = isHovered || hovered ? project.scale * 1.2 : project.scale;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={project.position}>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
        <Sphere
          ref={meshRef}
          args={[1, 32, 32]}
          onClick={() => onClick(project.id)}
          onPointerOver={() => {
            setHovered(true);
            onHover(project.id);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
          }}
        >
          <meshStandardMaterial
            color={project.color}
            roughness={0.3}
            metalness={0.1}
            emissive={isHovered || hovered ? project.color : "#000000"}
            emissiveIntensity={0.1}
          />
        </Sphere>

        {/* Project title */}
        <Html
          position={[0, 1.5, 0]}
          center
          distanceFactor={8}
          occlude
          style={{
            pointerEvents: "none",
            opacity: isHovered || hovered ? 1 : 0.7,
            transition: "opacity 0.3s ease",
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
  );
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
  tech: string;
  index: number;
  total: number;
  isVisible: boolean;
}) {
  const orbRef = useRef<THREE.Mesh>(null);
  const angle = (index / total) * Math.PI * 2;

  useFrame((state) => {
    if (orbRef.current && isVisible) {
      // Orbit around the project
      const radius = 2;
      const x = Math.cos(angle + state.clock.elapsedTime * 0.5) * radius;
      const z = Math.sin(angle + state.clock.elapsedTime * 0.5) * radius;
      orbRef.current.position.set(x, 0, z);

      // Gentle floating
      orbRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + index) * 0.2;
    }
  });

  if (!isVisible) return null;

  return (
    <Box ref={orbRef} args={[0.1, 0.1, 0.1]}>
      <meshStandardMaterial color='#00ff88' emissive='#00ff88' emissiveIntensity={0.3} />
      <Html
        position={[0, 0.2, 0]}
        center
        distanceFactor={6}
        style={{
          pointerEvents: "none",
          fontSize: "10px",
          color: "white",
          background: "rgba(0,0,0,0.7)",
          padding: "2px 4px",
          borderRadius: "2px",
          whiteSpace: "nowrap",
        }}
      >
        {tech}
      </Html>
    </Box>
  );
}

/**
 * Scene setup with lighting and camera controls
 */
function Scene({ projects, onProjectClick }: Omit<Interactive3DDemoProps, "className">) {
  const { camera } = useThree();
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  // Set initial camera position
  React.useEffect(() => {
    camera.position.set(0, 0, 8);
  }, [camera]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={3}
        maxDistance={15}
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
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color='#000011' transparent opacity={0.3} />
      </mesh>
    </>
  );
}

/**
 * Main 3D demo component
 */
export function Interactive3DDemo({ projects, className, onProjectClick }: Interactive3DDemoProps) {
  return (
    <div
      className={cn(
        "w-full h-96 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden",
        className,
      )}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
      >
        <Scene projects={projects} onProjectClick={onProjectClick} />
      </Canvas>

      {/* Instructions overlay */}
      <div className='absolute bottom-4 left-4 text-white/70 text-sm'>
        <p>🖱️ Click and drag to rotate • 🔍 Scroll to zoom • 🎯 Click spheres to interact</p>
      </div>
    </div>
  );
}

/**
 * Hook to create sample project data
 */
export function useSampleProjects(): Project3D[] {
  return useMemo(
    () => [
      {
        id: "portfolio",
        title: "Portfolio Website",
        description: "Modern React portfolio with 3D elements",
        technologies: ["React", "Three.js", "TypeScript"],
        color: "#3b82f6",
        position: [-3, 2, 0],
        scale: 1,
      },
      {
        id: "ecommerce",
        title: "E-commerce Platform",
        description: "Full-stack e-commerce solution",
        technologies: ["Next.js", "Stripe", "PostgreSQL"],
        color: "#10b981",
        position: [3, 1, -1],
        scale: 0.8,
      },
      {
        id: "dashboard",
        title: "Analytics Dashboard",
        description: "Real-time data visualization dashboard",
        technologies: ["React", "D3.js", "WebSocket"],
        color: "#f59e0b",
        position: [0, -2, 2],
        scale: 1.2,
      },
      {
        id: "mobile-app",
        title: "Mobile App",
        description: "Cross-platform mobile application",
        technologies: ["React Native", "Firebase", "Expo"],
        color: "#ef4444",
        position: [-2, -1, -2],
        scale: 0.9,
      },
      {
        id: "api",
        title: "REST API",
        description: "Scalable REST API with authentication",
        technologies: ["Node.js", "Express", "JWT"],
        color: "#8b5cf6",
        position: [2, -1, 1],
        scale: 0.7,
      },
    ],
    [],
  );
}

export default Interactive3DDemo;
