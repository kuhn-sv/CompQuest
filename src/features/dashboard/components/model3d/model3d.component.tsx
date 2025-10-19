import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './model3d.component.scss';
import {
  createScene,
  createCamera,
  createRenderer,
  setupLighting,
  isCPUComponent,
  loadGLTFModel,
  calculateMousePosition,
  calculateTouchPosition,
  getTouchClientPosition,
  getIntersectedObject,
  createHighlightMaterial,
  createCPUPulseMaterial,
  updateCPUPulse,
  updateModelRotation,
  isDragGesture,
  calculateRotation,
  handleCameraResize,
  cleanupThreeJS,
  cleanupEventListeners,
  applyQualitySettings,
  shouldAnimate,
  MouseState
} from './model3d.helper';
import type { Model3DProps } from '../../interfaces';
import { PerformanceMonitor } from './performance.monitor';
import { QualityLevel } from '../../interfaces/performance.types';
import { getQualitySettings } from './quality.settings';

const Model3D: React.FC<Model3DProps> = ({ 
  modelPath, 
  onComponentClick, 
  onCpuClick,
  className = '',
  style = {}
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | undefined>(undefined);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rayRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuality, setCurrentQuality] = useState<QualityLevel>(QualityLevel.HIGH);
  
  // Performance monitoring
  const performanceMonitorRef = useRef<PerformanceMonitor | null>(null);
  const lastAnimationTimeRef = useRef<number>(0);
  
  // Mouse state management
  const mouseState = useRef<MouseState>({
    mouseX: 0,
    mouseY: 0,
    targetRotationX: 0,
    targetRotationY: 0,
    baseRotationX: 0,
    baseRotationY: 0,
    startMouseX: 0,
    startMouseY: 0,
    isMouseDown: false,
    isDragging: false,
    mouseDownPosition: { x: 0, y: 0 }
  });
  
  // CPU pulse animation
  const cpuMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const cpuMeshRef = useRef<THREE.Mesh | null>(null);
  
  const currentModelRef = useRef<THREE.Object3D | null>(null);
  const firstFrameShownRef = useRef<boolean>(false);

  useEffect(() => {
    if (!mountRef.current) {
      console.warn('No mountRef.current, returning early');
      return;
    }

    const currentMount = mountRef.current;

    // Scene setup
    const scene = createScene();
    sceneRef.current = scene;

    // Camera setup
    const camera = createCamera(currentMount.clientWidth, currentMount.clientHeight);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = createRenderer(currentMount.clientWidth, currentMount.clientHeight);
    rendererRef.current = renderer;
    currentMount.appendChild(renderer.domElement);

    // Lighting
    setupLighting(scene);
    
    // Performance monitoring setup
    const performanceMonitor = new PerformanceMonitor(QualityLevel.HIGH);
    performanceMonitorRef.current = performanceMonitor;
    
    // Handle quality changes
    performanceMonitor.onQualityChange((newQuality: QualityLevel) => {
      console.log(`[Model3D] Adjusting quality to: ${newQuality}`);
      setCurrentQuality(newQuality);
      
      if (sceneRef.current && rendererRef.current && currentMount) {
        applyQualitySettings(
          rendererRef.current,
          sceneRef.current,
          currentModelRef.current,
          newQuality,
          currentMount.clientWidth,
          currentMount.clientHeight
        );
      }
    });

    // Load the GLTF file (no placeholder)
    loadGLTFModel(
      modelPath,
      scene,
      null,
      (modelGroup) => {
        currentModelRef.current = modelGroup;
        // Find and apply CPU pulse animation
        setupCPUPulseAnimation(modelGroup);
        // Precompile shaders/materials to reduce first-frame hitch
        try {
          renderer.compile(scene, camera);
        } catch {
          // noop
        }
      },
      (error) => {
        // Some loaders emit ProgressEvent in error callback during streaming; ignore those
        if (!(error instanceof ProgressEvent)) {
          console.warn('Could not load GLTF file:', error);
        }
        setIsLoading(false);
      }
    );

    // Setup CPU pulse animation
    const setupCPUPulseAnimation = (model: THREE.Object3D) => {
      let cpuFound = false;
      
      model.traverse((child) => {
        if (child instanceof THREE.Mesh && isCPUComponent(child.name)) {
          cpuFound = true;
          
          // Apply pulse material
          const pulseMaterial = createCPUPulseMaterial();
          child.material = pulseMaterial;
          cpuMaterialRef.current = pulseMaterial;
          cpuMeshRef.current = child;
        }
      });
      
      if (!cpuFound) {
        console.warn('No CPU component found in model. Available children:');
      }
    };

    // Click detection
    const handleClick = (event: MouseEvent) => {
      if (mouseState.current.isDragging) return;

      const rect = currentMount.getBoundingClientRect();
      const mouse = calculateMousePosition(event, rect);
      const mouseVector = new THREE.Vector2(mouse.x, mouse.y);

      if (cameraRef.current && sceneRef.current) {
        const intersectedObject = getIntersectedObject(
          mouseVector, 
          cameraRef.current, 
          sceneRef.current, 
          rayRef.current
        );

        if (intersectedObject) {
          const partName = intersectedObject.name;
          
          if (isCPUComponent(partName)) {
            onCpuClick?.();
            
            // Brief highlight effect
            const originalMaterial = intersectedObject.material;
            const highlightMaterial = createHighlightMaterial();
            intersectedObject.material = highlightMaterial;
            
            setTimeout(() => {
              intersectedObject.material = originalMaterial;
            }, 1000);
          } else {
            onComponentClick?.(partName);
          }
        }
      }
    };

    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        mouseState.current.isMouseDown = true;
        mouseState.current.isDragging = false;
        mouseState.current.mouseDownPosition.x = event.clientX;
        mouseState.current.mouseDownPosition.y = event.clientY;
        
        if (currentModelRef.current) {
          mouseState.current.baseRotationX = currentModelRef.current.rotation.x;
          mouseState.current.baseRotationY = currentModelRef.current.rotation.y;
        }
        
        const rect = currentMount.getBoundingClientRect();
        const mouse = calculateMousePosition(event, rect);
        mouseState.current.startMouseX = mouse.x;
        mouseState.current.startMouseY = mouse.y;
        
        currentMount.style.cursor = 'grabbing';
      }
    };

    const onMouseUp = (event: MouseEvent) => {
      if (event.button === 0) {
        const wasMouseDown = mouseState.current.isMouseDown;
        mouseState.current.isMouseDown = false;
        currentMount.style.cursor = 'grab';
        
        if (wasMouseDown && !mouseState.current.isDragging) {
          handleClick(event);
        }
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!mouseState.current.isMouseDown) {
        return; // Removed hover logic
      }
      
      if (mouseState.current.isMouseDown) {
        const currentPos = { x: event.clientX, y: event.clientY };
        
        if (isDragGesture(currentPos, mouseState.current.mouseDownPosition)) {
          mouseState.current.isDragging = true;
        }
      }
      
      const rect = currentMount.getBoundingClientRect();
      const mouse = calculateMousePosition(event, rect);
      mouseState.current.mouseX = mouse.x;
      mouseState.current.mouseY = mouse.y;
      
      const rotation = calculateRotation(
        mouseState.current.mouseX,
        mouseState.current.mouseY,
        mouseState.current.startMouseX,
        mouseState.current.startMouseY,
        mouseState.current.baseRotationX,
        mouseState.current.baseRotationY
      );
      
      mouseState.current.targetRotationX = rotation.rotationX;
      mouseState.current.targetRotationY = rotation.rotationY;
    };

    // Touch event handlers
    const onTouchStart = (event: TouchEvent) => {
      const touch = getTouchClientPosition(event);
      if (!touch) return;
      
      mouseState.current.isMouseDown = true;
      mouseState.current.isDragging = false;
      mouseState.current.mouseDownPosition.x = touch.x;
      mouseState.current.mouseDownPosition.y = touch.y;
      
      if (currentModelRef.current) {
        mouseState.current.baseRotationX = currentModelRef.current.rotation.x;
        mouseState.current.baseRotationY = currentModelRef.current.rotation.y;
      }
      
      const rect = currentMount.getBoundingClientRect();
      if (event.touches.length > 0) {
        const touchPos = calculateTouchPosition(event.touches[0], rect);
        mouseState.current.startMouseX = touchPos.x;
        mouseState.current.startMouseY = touchPos.y;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!mouseState.current.isMouseDown) return;
      
      // Prevent default to avoid scrolling while rotating model
      event.preventDefault();
      
      const touch = getTouchClientPosition(event);
      if (!touch) return;
      
      const currentPos = { x: touch.x, y: touch.y };
      
      if (isDragGesture(currentPos, mouseState.current.mouseDownPosition)) {
        mouseState.current.isDragging = true;
      }
      
      const rect = currentMount.getBoundingClientRect();
      if (event.touches.length > 0) {
        const touchPos = calculateTouchPosition(event.touches[0], rect);
        mouseState.current.mouseX = touchPos.x;
        mouseState.current.mouseY = touchPos.y;
        
        const rotation = calculateRotation(
          mouseState.current.mouseX,
          mouseState.current.mouseY,
          mouseState.current.startMouseX,
          mouseState.current.startMouseY,
          mouseState.current.baseRotationX,
          mouseState.current.baseRotationY
        );
        
        mouseState.current.targetRotationX = rotation.rotationX;
        mouseState.current.targetRotationY = rotation.rotationY;
      }
    };

    const onTouchEnd = (event: TouchEvent) => {
      const wasMouseDown = mouseState.current.isMouseDown;
      const wasDragging = mouseState.current.isDragging;
      
      mouseState.current.isMouseDown = false;
      
      // Handle tap as click if not dragging
      if (wasMouseDown && !wasDragging && event.changedTouches.length > 0) {
        const touch = event.changedTouches[0];
        const rect = currentMount.getBoundingClientRect();
        const touchPos = calculateTouchPosition(touch, rect);
        const touchVector = new THREE.Vector2(touchPos.x, touchPos.y);

        if (cameraRef.current && sceneRef.current) {
          const intersectedObject = getIntersectedObject(
            touchVector,
            cameraRef.current,
            sceneRef.current,
            rayRef.current
          );

          if (intersectedObject) {
            const partName = intersectedObject.name;
            
            if (isCPUComponent(partName)) {
              onCpuClick?.();
              
              const originalMaterial = intersectedObject.material;
              const highlightMaterial = createHighlightMaterial();
              intersectedObject.material = highlightMaterial;
              
              setTimeout(() => {
                intersectedObject.material = originalMaterial;
              }, 1000);
            } else {
              onComponentClick?.(partName);
            }
          }
        }
      }
    };

    // Event listeners
    currentMount.addEventListener('mousedown', onMouseDown);
    currentMount.addEventListener('mouseup', onMouseUp);
    currentMount.addEventListener('mousemove', onMouseMove);
    currentMount.addEventListener('mouseleave', () => {
      mouseState.current.isMouseDown = false;
      currentMount.style.cursor = 'grab';
    });

    // Touch event listeners
    currentMount.addEventListener('touchstart', onTouchStart, { passive: true });
    currentMount.addEventListener('touchmove', onTouchMove, { passive: false });
    currentMount.addEventListener('touchend', onTouchEnd);
    currentMount.addEventListener('touchcancel', () => {
      mouseState.current.isMouseDown = false;
    });

    currentMount.style.cursor = 'grab';

    // Animation loop with CPU pulse animation and performance monitoring
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      const currentTime = performance.now();
      
      // Get current quality settings for FPS throttling
      const qualitySettings = getQualitySettings(currentQuality);
      
      // Only animate if enough time has passed (FPS throttling)
      if (!shouldAnimate(lastAnimationTimeRef.current, qualitySettings.targetFPS, currentTime)) {
        return;
      }
      
      lastAnimationTimeRef.current = currentTime;
      
      // Record frame for performance monitoring (only when actually rendering)
      if (performanceMonitor) {
        performanceMonitor.recordFrame();
      }

      if (currentModelRef.current) {
        updateModelRotation(
          currentModelRef.current, 
          mouseState.current.targetRotationX, 
          mouseState.current.targetRotationY
        );
      }

      // Update CPU pulse animation
      if (cpuMaterialRef.current) {
        updateCPUPulse(cpuMaterialRef.current, Date.now());
      }

      renderer.render(scene, camera);

      // After the first meaningful frame is rendered, hide the loader once
      if (!firstFrameShownRef.current && currentModelRef.current) {
        const calls = renderer.info.render.calls;
        if (calls > 0) {
          firstFrameShownRef.current = true;
          setIsLoading(false);
        }
      }
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!currentMount) return;
      
      handleCameraResize(camera, renderer, currentMount.clientWidth, currentMount.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      const eventListeners = [
        { event: 'mousedown' as const, handler: onMouseDown as EventListener },
        { event: 'mouseup' as const, handler: onMouseUp as EventListener },
        { event: 'mousemove' as const, handler: onMouseMove as EventListener },
        { event: 'touchstart' as const, handler: onTouchStart as EventListener },
        { event: 'touchmove' as const, handler: onTouchMove as EventListener },
        { event: 'touchend' as const, handler: onTouchEnd as EventListener }
      ];
      
      cleanupEventListeners(currentMount, eventListeners);
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      // Cleanup performance monitor
      if (performanceMonitorRef.current) {
        performanceMonitorRef.current.dispose();
        performanceMonitorRef.current = null;
      }
      
      // Note: Label cleanup not needed as it's now a child of the model
      // and will be automatically cleaned up when the model is removed
      
      cleanupThreeJS(renderer, currentMount);
    };
  }, [modelPath, onComponentClick, onCpuClick, currentQuality]);

  return (
    <div className={`model3d ${className}`} style={style}>
      <div className="model3d__viewer" ref={mountRef}>
        {isLoading && (
          <div className="model3d__loading" role="status" aria-live="polite">
            <span className="spinner" />
            <span className="label">Lade 3D-Modell…</span>
          </div>
        )}
        {!isLoading && currentQuality === QualityLevel.LOW && (
          <div className="model3d__quality-indicator" title="Reduzierte Qualität für bessere Performance">
            <span>🔋 Energie-Sparmodus</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Model3D;