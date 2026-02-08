/// <reference types="vite/client" />

// Extend JSX for @react-three/fiber
import '@react-three/fiber'
import type { JSXIntrinsicElements } from '@react-three/fiber'

// Properly extend JSX for React Three Fiber with all required elements
declare global {
  namespace JSX {
    interface IntrinsicElements extends JSXIntrinsicElements {
      mesh: unknown
      group: unknown
      ambientLight: unknown
      directionalLight: unknown
      pointLight: unknown
      planeGeometry: unknown
      meshStandardMaterial: unknown
      meshBasicMaterial: unknown
    }
  }
}
