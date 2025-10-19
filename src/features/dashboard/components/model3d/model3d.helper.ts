import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { QualityLevel, QualitySettings } from '../../interfaces/performance.types';
import { getQualitySettings } from './quality.settings';
import { getModelPathForQuality, requiresModelSwap } from './lod.config';
// Enable caching of fetched assets to speed up subsequent loads
THREE.Cache.enabled = true;

// Re-export interfaces for convenience
export type { MouseState, SceneRefs } from '../../interfaces';

// Scene creation and setup
export const createScene = (): THREE.Scene => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a1a);
  return scene;
};

export const createCamera = (width: number, height: number): THREE.PerspectiveCamera => {
  const camera = new THREE.PerspectiveCamera(25, width / height, 0.1, 1000);
  camera.position.set(0, 0, 25);
  return camera;
};

export const createRenderer = (width: number, height: number): THREE.WebGLRenderer => {
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = false;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 2.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
};

// Lighting setup
export const setupLighting = (scene: THREE.Scene): void => {
  const ambientLight = new THREE.AmbientLight(0x404040, 2.0);
  scene.add(ambientLight);

  const lightIntensity = 1.0;
  const lights = [
    { position: [0, 0, 10], name: 'front' },
    { position: [0, 0, -10], name: 'back' },
    { position: [-10, 0, 0], name: 'left' },
    { position: [10, 0, 0], name: 'right' },
    { position: [0, 10, 0], name: 'top' },
    { position: [0, -10, 0], name: 'bottom' }
  ];

  lights.forEach(({ position }) => {
    const light = new THREE.DirectionalLight(0xffffff, lightIntensity);
    light.position.set(position[0], position[1], position[2]);
    light.castShadow = false;
    scene.add(light);
  });
};

// CPU component detection
export const isCPUComponent = (partName: string): boolean => {
  const cpuKeywords = ['cpulid'];
  return cpuKeywords.some(keyword => 
    partName.toLowerCase().includes(keyword.toLowerCase())
  );
};

// Placeholder creation
export const createPlaceholder = (): THREE.Group => {
  const group = new THREE.Group();
  
  const geometry = new THREE.BoxGeometry(2, 1, 0.2);
  const material = new THREE.MeshLambertMaterial({ 
    color: 0x2d5a27,
    side: THREE.DoubleSide,
  });
  const mainBoard = new THREE.Mesh(geometry, material);
  mainBoard.name = 'mainboard';
  mainBoard.castShadow = false;
  mainBoard.receiveShadow = false;
  group.add(mainBoard);

  const cpuGeometry = new THREE.BoxGeometry(0.5, 0.15, 0.5);
  const cpuMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const cpu = new THREE.Mesh(cpuGeometry, cpuMaterial);
  cpu.name = 'cpulid';
  cpu.position.set(-0.5, 0.2, 0);
  group.add(cpu);

  return group;
};

// Model loading and processing
export const loadGLTFModel = (
  modelPath: string,
  scene: THREE.Scene,
  placeholderGroup?: THREE.Group | null,
  onLoaded?: (model: THREE.Group) => void,
  onProgress?: (progress: ProgressEvent) => void,
  onError?: (error: unknown) => void
): void => {
  const loader = new GLTFLoader();

  loader.load(
    modelPath,
    (gltf) => {

      if (placeholderGroup) {
        scene.remove(placeholderGroup);
      }

      const object = gltf.scene;

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = false;
          child.receiveShadow = false;

          if (!child.name || child.name === '') {
            child.name = `mesh-${Math.random().toString(36).substr(2, 9)}`;
          }

          const material = (child as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
          if (material) {
            if (Array.isArray(material)) {
              (material as THREE.Material[]).forEach((m) => {
                m.needsUpdate = true;
              });
            } else {
              (material as THREE.Material).needsUpdate = true;
            }
          }
        }
      });

      const modelGroup = scaleAndCenterModel(object);
      scene.add(modelGroup);
      onLoaded?.(modelGroup);
    },
    (progress) => {
      onProgress?.(progress);
    },
    (error) => {
      onError?.(error);
    }
  );
};

// Model scaling and centering
export const scaleAndCenterModel = (object: THREE.Object3D): THREE.Group => {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  
  const modelGroup = new THREE.Group();
  object.position.sub(center);
  modelGroup.add(object);
  
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 10 / maxDim;
  modelGroup.scale.setScalar(scale);
  
  return modelGroup;
};

// Mouse position calculation
export const calculateMousePosition = (
  event: MouseEvent,
  rect: DOMRect
): { x: number; y: number } => {
  return {
    x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
    y: -((event.clientY - rect.top) / rect.height) * 2 + 1
  };
};

// Touch position calculation
export const calculateTouchPosition = (
  touch: Touch,
  rect: DOMRect
): { x: number; y: number } => {
  return {
    x: ((touch.clientX - rect.left) / rect.width) * 2 - 1,
    y: -((touch.clientY - rect.top) / rect.height) * 2 + 1
  };
};

// Get client position from touch event
export const getTouchClientPosition = (
  event: TouchEvent
): { x: number; y: number } | null => {
  if (event.touches.length > 0) {
    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
  if (event.changedTouches.length > 0) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY
    };
  }
  return null;
};

// Raycast intersection
export const getIntersectedObject = (
  mouse: THREE.Vector2,
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene,
  raycaster: THREE.Raycaster
): THREE.Mesh | null => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  if (intersects.length > 0) {
    return intersects[0].object as THREE.Mesh;
  }
  
  return null;
};

// Click material management
export const createHighlightMaterial = (): THREE.MeshBasicMaterial => {
  return new THREE.MeshBasicMaterial({ color: 0x00ff00 });
};

// CPU pulse animation
export const createCPUPulseMaterial = (): THREE.MeshBasicMaterial => {
  return new THREE.MeshBasicMaterial({ 
    color: 0x4169E1, // Royal Blue
    transparent: true,
    opacity: 1.0
  });
};

export const updateCPUPulse = (material: THREE.MeshBasicMaterial, time: number): void => {
  // Create a pulsing effect using sine wave
  const pulseIntensity = (Math.sin(time * 0.003) + 1) * 0.5; // 0 to 1
  const minOpacity = 0.3;
  const maxOpacity = 1.0;

  material.opacity = minOpacity + (maxOpacity - minOpacity) * pulseIntensity;
  material.needsUpdate = true;
};

// Model rotation animation
export const updateModelRotation = (
  model: THREE.Object3D,
  targetRotationX: number,
  targetRotationY: number,
  smoothingFactor: number = 0.05
): void => {
  model.rotation.y += (targetRotationY - model.rotation.y) * smoothingFactor;
  model.rotation.x += (targetRotationX - model.rotation.x) * smoothingFactor;
};

// Drag detection
export const isDragGesture = (
  currentPos: { x: number; y: number },
  startPos: { x: number; y: number },
  threshold: number = 5
): boolean => {
  const dragDistance = Math.sqrt(
    Math.pow(currentPos.x - startPos.x, 2) + 
    Math.pow(currentPos.y - startPos.y, 2)
  );
  return dragDistance > threshold;
};

// Rotation calculation
export const calculateRotation = (
  mouseX: number,
  mouseY: number,
  startMouseX: number,
  startMouseY: number,
  baseRotationX: number,
  baseRotationY: number
): { rotationX: number; rotationY: number } => {
  const deltaX = mouseX - startMouseX;
  const deltaY = mouseY - startMouseY;
  
  return {
    rotationX: baseRotationX - deltaY * Math.PI * 0.25,
    rotationY: baseRotationY + deltaX * Math.PI * 0.5
  };
};

// Camera resize handling
export const handleCameraResize = (
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer,
  width: number,
  height: number
): void => {
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

// Animation loop creator
export const createAnimationLoop = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  getCurrentModel: () => THREE.Object3D | null,
  getTargetRotation: () => { x: number; y: number }
): (() => void) => {
  let animationId: number;
  
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    
    const currentModel = getCurrentModel();
    if (currentModel) {
      const targetRotation = getTargetRotation();
      updateModelRotation(currentModel, targetRotation.x, targetRotation.y);
    }
    
    renderer.render(scene, camera);
  };
  
  animate();
  
  return () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
};

// Cleanup utilities
export const cleanupThreeJS = (
  renderer: THREE.WebGLRenderer,
  mountElement: HTMLElement | null
): void => {
  if (mountElement && renderer.domElement && mountElement.contains(renderer.domElement)) {
    mountElement.removeChild(renderer.domElement);
  }
  renderer.dispose();
};

export const cleanupEventListeners = (
  element: HTMLElement,
  listeners: Array<{ event: string; handler: EventListener }>
): void => {
  listeners.forEach(({ event, handler }) => {
    element.removeEventListener(event, handler);
  });
};

// ===== PERFORMANCE & QUALITY MANAGEMENT =====

/**
 * Apply quality settings to renderer
 */
export const applyRendererQuality = (
  renderer: THREE.WebGLRenderer,
  quality: QualityLevel,
  width: number,
  height: number
): void => {
  const settings = getQualitySettings(quality);
  
  renderer.setPixelRatio(settings.pixelRatio);
  renderer.setSize(width, height);
  
  // Note: Antialiasing cannot be changed after renderer creation,
  // but we track it for potential renderer recreation
};

/**
 * Adjust lighting based on quality level
 */
export const adjustLighting = (
  scene: THREE.Scene,
  quality: QualityLevel
): void => {
  const settings = getQualitySettings(quality);
  
  // Remove all existing lights
  const lightsToRemove: THREE.Light[] = [];
  scene.traverse((child) => {
    if (child instanceof THREE.Light) {
      lightsToRemove.push(child);
    }
  });
  lightsToRemove.forEach(light => scene.remove(light));
  
  // Add ambient light (always present)
  const ambientLight = new THREE.AmbientLight(0x404040, 2.0);
  scene.add(ambientLight);
  
  // Add directional lights based on quality
  const lightIntensity = 1.0;
  
  if (settings.lightCount >= 1) {
    // Front light (most important)
    const frontLight = new THREE.DirectionalLight(0xffffff, lightIntensity);
    frontLight.position.set(0, 0, 10);
    frontLight.castShadow = false;
    scene.add(frontLight);
  }
  
  if (settings.lightCount >= 3) {
    // Add top and one side light
    const topLight = new THREE.DirectionalLight(0xffffff, lightIntensity);
    topLight.position.set(0, 10, 0);
    topLight.castShadow = false;
    scene.add(topLight);
    
    const sideLight = new THREE.DirectionalLight(0xffffff, lightIntensity);
    sideLight.position.set(10, 0, 0);
    sideLight.castShadow = false;
    scene.add(sideLight);
  }
  
  if (settings.lightCount >= 6) {
    // Add remaining lights (back, left, bottom)
    const lights = [
      { position: [0, 0, -10], name: 'back' },
      { position: [-10, 0, 0], name: 'left' },
      { position: [0, -10, 0], name: 'bottom' }
    ];
    
    lights.forEach(({ position }) => {
      const light = new THREE.DirectionalLight(0xffffff, lightIntensity);
      light.position.set(position[0], position[1], position[2]);
      light.castShadow = false;
      scene.add(light);
    });
  }
};

/**
 * Store original materials for restoration
 */
const originalMaterialsMap = new WeakMap<THREE.Mesh, THREE.Material | THREE.Material[]>();

/**
 * Simplify materials for better performance
 */
export const simplifyMaterials = (
  model: THREE.Object3D,
  quality: QualityLevel
): void => {
  const settings = getQualitySettings(quality);
  
  if (!settings.useMaterialSimplification) {
    // Restore original materials if we have them
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const originalMaterial = originalMaterialsMap.get(child);
        if (originalMaterial) {
          child.material = originalMaterial;
        }
      }
    });
    return;
  }
  
  // Apply simplified materials
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Store original material if not already stored
      if (!originalMaterialsMap.has(child)) {
        originalMaterialsMap.set(child, child.material);
      }
      
      // Skip CPU component (it has its own pulsing material)
      if (isCPUComponent(child.name)) {
        return;
      }
      
      const originalMaterial = Array.isArray(child.material) 
        ? child.material[0] 
        : child.material;
      
      if (originalMaterial instanceof THREE.MeshStandardMaterial || 
          originalMaterial instanceof THREE.MeshPhongMaterial) {
        
        // Create a simple material with basic lighting
        const simplifiedMaterial = new THREE.MeshBasicMaterial({
          color: originalMaterial.color,
          map: originalMaterial.map,
          transparent: originalMaterial.transparent,
          opacity: originalMaterial.opacity,
          side: originalMaterial.side
        });
        
        child.material = simplifiedMaterial;
      }
    }
  });
};

/**
 * Check if enough time has passed for next animation frame based on target FPS
 */
export const shouldAnimate = (
  lastAnimationTime: number,
  targetFPS: number,
  currentTime: number
): boolean => {
  const frameDelay = 1000 / targetFPS;
  return (currentTime - lastAnimationTime) >= frameDelay;
};

/**
 * Apply all quality settings at once
 */
export const applyQualitySettings = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  model: THREE.Object3D | null,
  quality: QualityLevel,
  width: number,
  height: number
): void => {
  // Apply renderer settings
  applyRendererQuality(renderer, quality, width, height);
  
  // Adjust lighting
  adjustLighting(scene, quality);
  
  // Simplify materials if model is loaded
  if (model) {
    simplifyMaterials(model, quality);
  }
};

// ===== LOD (LEVEL OF DETAIL) SYSTEM =====

/**
 * Unload current model from scene and cleanup
 */
export const unloadCurrentModel = (
  scene: THREE.Scene,
  model: THREE.Object3D | null
): void => {
  if (!model) return;
  
  // Remove from scene
  scene.remove(model);
  
  // Traverse and dispose of geometries and materials
  model.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    }
  });
};

/**
 * Swap model for a different LOD version
 * Preserves rotation state and applies smooth transition
 */
export const swapModel = (
  scene: THREE.Scene,
  currentModel: THREE.Object3D | null,
  newQuality: QualityLevel,
  onLoaded: (newModel: THREE.Group) => void,
  onError?: (error: unknown) => void
): void => {
  const modelPath = getModelPathForQuality(newQuality);
  
  console.log(`[ModelSwap] Loading ${modelPath} for ${newQuality} quality`);
  
  // Store current rotation if model exists
  const currentRotation = currentModel ? {
    x: currentModel.rotation.x,
    y: currentModel.rotation.y,
    z: currentModel.rotation.z
  } : null;
  
  // Load new model
  loadGLTFModel(
    modelPath,
    scene,
    null,
    (newModel) => {
      // Remove old model
      if (currentModel) {
        unloadCurrentModel(scene, currentModel);
      }
      
      // Apply previous rotation to new model
      if (currentRotation) {
        newModel.rotation.set(currentRotation.x, currentRotation.y, currentRotation.z);
      }
      
      console.log(`[ModelSwap] Successfully loaded ${modelPath}`);
      onLoaded(newModel);
    },
    undefined,
    onError
  );
};

/**
 * Check if quality change requires model swap
 */
export const needsModelSwap = (
  currentQuality: QualityLevel,
  newQuality: QualityLevel
): boolean => {
  return requiresModelSwap(currentQuality, newQuality);
};