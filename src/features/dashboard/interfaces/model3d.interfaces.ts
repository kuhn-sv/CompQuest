import * as THREE from 'three';

export interface MouseState {
  mouseX: number;
  mouseY: number;
  targetRotationX: number;
  targetRotationY: number;
  baseRotationX: number;
  baseRotationY: number;
  startMouseX: number;
  startMouseY: number;
  isMouseDown: boolean;
  isDragging: boolean;
  mouseDownPosition: { x: number; y: number };
}

export interface HoverState {
  hoveredObject: THREE.Mesh | null;
  originalHoveredMaterial: THREE.Material | THREE.Material[] | null;
}

export interface SceneRefs {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  raycaster: THREE.Raycaster;
}

export interface Model3DProps {
  modelPath: string;
  onComponentClick?: (componentName: string) => void;
  onCpuClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}