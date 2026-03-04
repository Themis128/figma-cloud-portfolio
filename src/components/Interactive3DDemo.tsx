// @ts-nocheck

import { Box, Float, Html, OrbitControls, Sphere } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AmbientLight, DirectionalLight, PointLight, MeshStandardMaterial, PlaneGeometry, MeshBasicMaterial, Mesh, Group } from "@react-three/fiber";
import React, { useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { cn } from "@/lib/utils";

// Animation constants
const ROTATION_SPEED_X = 0.005;
const ROTATION_SPEED_Y = 0.01;
const HOVER_SCALE_MULTIPLIER = 1.2;
const LERP_FACTOR = 0.1;

// 3D Geometry constants
const SPHERE_RADIUS = 1;
const SPHERE_WIDTH_SEGMENTS = 32;
const SPHERE_HEIGHT_SEGMENTS = 32;
const ORB_SIZE = 0.1;
const ORBIT_RADIUS = 2;
const ORBIT_SPEED = 0.5;
const FLOAT_AMPLITUDE = 0.2;
const FLOAT_SPEED = 2;

// UI constants
const TITLE_POSITION_Y = 1.5;
const TITLE_DISTANCE_FACTOR = 8;
const TITLE_OPACITY_DEFAULT = 0.7;
const TITLE_TRANSITION_DURATION = 0.3;
const ORB_LABEL_POSITION_Y = 0.2;
const ORB_LABEL_DISTANCE_FACTOR = 6;

// Lighting constants
const AMBIENT_LIGHT_INTENSITY = 0.4;
const DIRECTIONAL_LIGHT_X = 5;
const DIRECTIONAL_LIGHT_Y = 5;
const DIRECTIONAL_LIGHT_Z = 5;
const DIRECTIONAL_LIGHT_POSITION: [number, number, number] = [
  DIRECTIONAL_LIGHT_X,
  DIRECTIONAL_LIGHT_Y,
  DIRECTIONAL_LIGHT_Z,
];
const DIRECTIONAL_LIGHT_INTENSITY = 1;
const POINT_LIGHT_X = -5;
const POINT_LIGHT_Y = 5;
const POINT_LIGHT_Z = -5;
const POINT_LIGHT_POSITION: [number, number, number] = [
  POINT_LIGHT_X,
  POINT_LIGHT_Y,
  POINT_LIGHT_Z,
];
const POINT_LIGHT_INTENSITY = 0.5;

// Camera constants
const CAMERA_X = 0;
const CAMERA_Y = 0;
const CAMERA_Z = 8;
const CAMERA_POSITION: [number, number, number] = [
  CAMERA_X,
  CAMERA_Y,
  CAMERA_Z,
];
const CAMERA_FOV = 60;
const CAMERA_DPR: [number, number] = [1, 2];

// Float animation constants
const FLOAT_SPEED_VALUE = 2;
const FLOAT_ROTATION_INTENSITY = 0.5;
const FLOAT_INTENSITY = 0.2;

// Orbit controls constants
const MIN_DISTANCE = 3;
const MAX_DISTANCE = 20;
const MAX_POLAR_ANGLE = Math.PI / 2;

// Background constants
const BACKGROUND_POSITION: [number, number, number] = [0, 0, -10];
const BACKGROUND_SIZE = 50;
const BACKGROUND_OPACITY = 0.1;

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
  // Use forwardRef to properly handle refs in function components
  const meshRef = React.forwardRef<THREE.Mesh, any>((props, ref) => {
    return <Sphere {...props} ref={ref} />;
  });
  const [hovered, setHovered] = useState(false);

  useFrame((_state) => {
    if (meshRef.current) {
      // Gentle rotation
      meshRef.current.rotation.x += ROTATION_SPEED_X;
      meshRef.current.rotation.y += ROTATION_SPEED_Y;

      // Scale animation on hover
      const targetScale =
        isHovered || hovered
          ? project.scale * HOVER_SCALE_MULTIPLIER
          : project.scale;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        LERP_FACTOR,
      );
    }
  });

  return (
    <Group position={project.position}>
      <Float
        speed={FLOAT_SPEED_VALUE}
        rotationIntensity={FLOAT_ROTATION_INTENSITY}
        floatIntensity={FLOAT_INTENSITY}
      >
        <Sphere
          ref={meshRef}
          args={[SPHERE_RADIUS, SPHERE_WIDTH_SEGMENTS, SPHERE_HEIGHT_SEGMENTS]}
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
          <MeshStandardMaterial
            color={project.color}
            roughness={0.3}
            metalness={0.1}
            emissive={isHovered || hovered ? project.color : "#000000"}
            emissiveIntensity={0.1}
          />
        </Sphere>

        {/* Project title */}
        <Html
          position={[0, TITLE_POSITION_Y, 0]}
          center
          distanceFactor={TITLE_DISTANCE_FACTOR}
          occlude
          style={{
            pointerEvents: "none",
            opacity: isHovered || hovered ? 1 : TITLE_OPACITY_DEFAULT,
            transition: `opacity ${TITLE_TRANSITION_DURATION}s ease`,
          }}
        >
          <div className="text-center">
            <h3 className="text-white font-bold text-sm bg-black/50 px-2 py-1 rounded">
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
    </Group>
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
      const radius = ORBIT_RADIUS;
      const x =
        Math.cos(angle + state.clock.elapsedTime * ORBIT_SPEED) * radius;
      const z =
        Math.sin(angle + state.clock.elapsedTime * ORBIT_SPEED) * radius;
      orbRef.current.position.set(x, 0, z);

      // Gentle floating
      orbRef.current.position.y =
        Math.sin(state.clock.elapsedTime * FLOAT_SPEED + index) *
        FLOAT_AMPLITUDE;
    }
  });

  if (!isVisible) return null;

  return (
    <Box ref={orbRef} args={[ORB_SIZE, ORB_SIZE, ORB_SIZE]}>
      <meshStandardMaterial
        color="#00ff88"
        emissive="#00ff88"
        emissiveIntensity={0.3}
      />
      <Html
        position={[0, ORB_LABEL_POSITION_Y, 0]}
        center
        distanceFactor={ORB_LABEL_DISTANCE_FACTOR}
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
function Scene({
  projects,
  onProjectClick,
}: Omit<Interactive3DDemoProps, "className">) {
  const { camera } = useThree();
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);

  // Set initial camera position
  React.useEffect(() => {
    camera.position.set(...CAMERA_POSITION);
  }, [camera]);

  return (
    <>
      {/* Lighting */}
<AmbientLight intensity={AMBIENT_LIGHT_INTENSITY} />
<DirectionalLight
        position={DIRECTIONAL_LIGHT_POSITION}
        intensity={DIRECTIONAL_LIGHT_INTENSITY}
      />
      <PointLight
        position={POINT_LIGHT_POSITION}
        intensity={POINT_LIGHT_INTENSITY}
      />

      {/* Camera controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={MIN_DISTANCE}
        maxDistance={MAX_DISTANCE}
        maxPolarAngle={MAX_POLAR_ANGLE}
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
      <Mesh position={BACKGROUND_POSITION}>
        <PlaneGeometry args={[BACKGROUND_SIZE, BACKGROUND_SIZE]} />
        <MeshBasicMaterial
          color="#000011"
          transparent
          opacity={BACKGROUND_OPACITY}
        />
      </Mesh>
    </>
  );
}

/**
 * Main 3D demo component
 */
export function Interactive3DDemo({
  projects,
  className,
  onProjectClick,
}: Interactive3DDemoProps) {
  return (
    <div
      className={cn(
        "w-full h-96 bg-linear-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden",
        className,
      )}
    >
      <Canvas
        camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={CAMERA_DPR}
      >
        <Scene projects={projects} onProjectClick={onProjectClick} />
      </Canvas>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 text-white/70 text-sm">
        <p>
          🖱️ Click and drag to rotate • 🔍 Scroll to zoom • 🎯 Click spheres to
          interact
        </p>
      </div>
    </div>
  );
}

/**
 * Hook to create sample project data
 */
export function useSampleProjects(): Project3D[] {
  return useMemo(() => {
    const positions = {
      portfolio: [-3, 2, 0] as [number, number, number],
      ecommerce: [3, 1, -1] as [number, number, number],
      dashboard: [0, -2, 2] as [number, number, number],
      mobileApp: [-2, -1, -2] as [number, number, number],
      api: [2, -1, 1] as [number, number, number],
    };
    return [
      {
        id: "portfolio",
        title: "Portfolio Website",
        description: "Modern React portfolio with 3D elements",
        technologies: ["React", "Three.js", "TypeScript"],
        color: "#3b82f6",
        position: positions.portfolio,
        scale: 1,
      },
      {
        id: "ecommerce",
        title: "E-commerce Platform",
        description: "Full-stack e-commerce solution",
        technologies: ["Next.js", "Stripe", "PostgreSQL"],
        color: "#10b981",
        position: positions.ecommerce,
        scale: 0.8,
      },
      {
        id: "dashboard",
        title: "Analytics Dashboard",
        description: "Real-time data visualization dashboard",
        technologies: ["React", "D3.js", "WebSocket"],
        color: "#f59e0b",
        position: positions.dashboard,
        scale: 1.2,
      },
      {
        id: "mobile-app",
        title: "Mobile App",
        description: "Cross-platform mobile application",
        technologies: ["React Native", "Firebase", "Expo"],
        color: "#ef4444",
        position: positions.mobileApp,
        scale: 0.9,
      },
      {
        id: "api",
        title: "REST API",
        description: "Scalable REST API with authentication",
        technologies: ["Node.js", "Express", "JWT"],
        color: "#8b5cf6",
        position: positions.api,
        scale: 0.7,
      },
    ];
  }, []);
}

export default Interactive3DDemo;
