/// <reference types="vite/client" />

// Extend JSX for @react-three/fiber
import "@react-three/fiber";

declare module "@react-three/fiber" {
  interface ThreeElements {
    group: unknown;
    mesh: unknown;
    meshStandardMaterial: unknown;
    meshBasicMaterial: unknown;
    ambientLight: unknown;
    directionalLight: unknown;
    pointLight: unknown;
    planeGeometry: unknown;
  }
}
