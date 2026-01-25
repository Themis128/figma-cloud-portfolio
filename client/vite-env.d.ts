/// <reference types="vite/client" />

// Extend JSX for @react-three/fiber
import "@react-three/fiber";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // @ts-expect-error - React Three Fiber JSX elements
      group: any;
      // @ts-expect-error - React Three Fiber JSX elements
      mesh: any;
      // @ts-expect-error - React Three Fiber JSX elements
      meshStandardMaterial: any;
      // @ts-expect-error - React Three Fiber JSX elements
      meshBasicMaterial: any;
      // @ts-expect-error - React Three Fiber JSX elements
      ambientLight: any;
      // @ts-expect-error - React Three Fiber JSX elements
      directionalLight: any;
      // @ts-expect-error - React Three Fiber JSX elements
      pointLight: any;
      // @ts-expect-error - React Three Fiber JSX elements
      planeGeometry: any;
    }
  }
}
