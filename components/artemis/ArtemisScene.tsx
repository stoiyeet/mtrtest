'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import {earthBody, moonBody} from "@/lib/CelestialBodies"
import SpaceBody from "@/components/SpaceBody";
import { createFlightCurve, getFlightState, loadPathCoordinates, SPEED_CONFIG } from '@/lib/artemisFlightPath';


interface ArtemisSceneProps {
  onSpacecraftClick: () => void;
  onHoverChange: (object: string | null) => void;
  animationProgress: number;
  isAnimating: boolean;
}

// Preload the Artemis model
useGLTF.preload('https://glb.asteroidstrike.earth/artemis1.glb');



function ArtemisSpacecraft({
  onClick,
  onHover,
  animationProgress,
  isAnimating,
  flightCurve,
  onPositionUpdate
}: {
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  animationProgress: number;
  isAnimating: boolean;
  flightCurve: THREE.CatmullRomCurve3;
  onPositionUpdate: (position: THREE.Vector3) => void;
}) {
  const { scene } = useGLTF('https://glb.asteroidstrike.earth/artemis1.glb');
  const spacecraftRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Clone the scene to avoid issues with multiple instances
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useFrame((state) => {
    if (spacecraftRef.current) {
      if (isAnimating) {
        // Follow flight path
        const flightState = getFlightState(flightCurve, animationProgress);
        spacecraftRef.current.position.copy(flightState.position);

        // Orient along path tangent (Y-axis points along tangent)
        spacecraftRef.current.quaternion.copy(flightState.quaternion);

        // Report position to parent for trail tracking
        onPositionUpdate(spacecraftRef.current.position.clone());
      } else {
        // Static position before animation starts
        spacecraftRef.current.position.set(4, 3, 2);
        // Gentle floating animation
        spacecraftRef.current.position.y = 3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        spacecraftRef.current.rotation.y += 0.003;
      }

      // Scale up slightly on hover
      const targetScale = hovered ? 0.015 : 0.012;
      spacecraftRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }
  });

  useEffect(() => {
    // Set cursor style
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  return (
    <primitive
      ref={spacecraftRef}
      object={clonedScene}
      scale={0.012}
      onClick={(e: any) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e: any) => {
        e.stopPropagation();
        setHovered(true);
        onHover(true);
      }}
      onPointerOut={(e: any) => {
        e.stopPropagation();
        setHovered(false);
        onHover(false);
      }}
    />
  );
}



function FlightPath({
  flightCurve,
  animationProgress,
  isAnimating,
  spacecraftPosition
}: {
  flightCurve: THREE.CatmullRomCurve3;
  animationProgress: number;
  isAnimating: boolean;
  spacecraftPosition: THREE.Vector3 | null;
}) {
  const trailTubeRef = useRef<THREE.Mesh>(null);
  const positionHistory = useRef<THREE.Vector3[]>([]);

  // Static faint gray path material
  const staticMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: new THREE.Color(0xaaaaaa),
      linewidth: 1,
      transparent: true,
      opacity: 0.15,
    });
  }, []);

  // Full path points for static display
  const staticPathPoints = useMemo(() => {
    return flightCurve.getPoints(300);
  }, [flightCurve]);

  // Reset position history when animation starts
  useEffect(() => {
    if (isAnimating) {
      positionHistory.current = [];
    }
  }, [isAnimating]);

  // Update trail using actual spacecraft positions
  useFrame(() => {
    if (isAnimating && spacecraftPosition) {
      // Add current position to history
      positionHistory.current.push(spacecraftPosition.clone());

      // Keep only the last N positions based on trail length
      const maxLength = Math.max(SPEED_CONFIG.trailLength, 2);
      if (positionHistory.current.length > maxLength) {
        positionHistory.current.shift();
      }

      // Update trail tube if we have enough points
      if (positionHistory.current.length > 1 && trailTubeRef.current) {
        const trailCurve = new THREE.CatmullRomCurve3(positionHistory.current);
        const tubeGeometry = new THREE.TubeGeometry(
          trailCurve,
          positionHistory.current.length * 3,
          0.04,
          8,
          false
        );

        trailTubeRef.current.geometry.dispose();
        trailTubeRef.current.geometry = tubeGeometry;
      }
    }
  });

  return (
    <>
      {/* Static faint path - always visible when animating */}
      {isAnimating && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(staticPathPoints.flatMap(p => [p.x, p.y, p.z])), 3]}
            />
          </bufferGeometry>
          <primitive object={staticMaterial} attach="material" />
        </line>
      )}

      {/* Simple red trail tube */}
      {isAnimating && (
        <mesh ref={trailTubeRef}>
          <tubeGeometry args={[flightCurve, 2, 0.04, 8, false]} />
          <meshBasicMaterial
            color={0xff3333}
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </>
  );
}

function Lighting() {
  return (
    <>
      {/* Main sun light */}
      <directionalLight
        position={[10, 5, 10]}
        intensity={2}
        color="#ffffff"
        castShadow
      />

      {/* Fill light from opposite side */}
      <directionalLight
        position={[-10, -5, -10]}
        intensity={0.3}
        color="#4080ff"
      />

      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.4} color="#8899ff" />

      {/* Point light near spacecraft for highlight */}
      <pointLight position={[4, 4, 3]} intensity={1} color="#00ccff" distance={10} />
    </>
  );
}

function Scene({
  onSpacecraftClick,
  onHoverChange,
  animationProgress,
  isAnimating
}: ArtemisSceneProps) {
  const [pathLoaded, setPathLoaded] = useState(false);
  const [spacecraftPosition, setSpacecraftPosition] = useState<THREE.Vector3 | null>(null);

  // Load path coordinates on mount
  useEffect(() => {
    loadPathCoordinates().then(() => {
      setPathLoaded(true);
    });
  }, []);

  const handleSpacecraftHover = (hovered: boolean) => {
    onHoverChange(hovered ? 'Artemis Spacecraft' : null);
  };

  const handlePositionUpdate = (position: THREE.Vector3) => {
    setSpacecraftPosition(position);
  };

  // Create flight curve once path is loaded
  const flightCurve = useMemo(() => {
    if (!pathLoaded) return null;
    return createFlightCurve();
  }, [pathLoaded]);

  // Don't render until path is loaded
  if (!pathLoaded || !flightCurve) {
    return (
      <>
        <PerspectiveCamera makeDefault position={[8, 4, 8]} fov={50} />
        <ambientLight intensity={0.5} />
        {/* Show loading state with celestial bodies only */}
        <SpaceBody celestialBody={moonBody} position={[5,0,0]} />
        <SpaceBody celestialBody={earthBody} position={[-3, 0, 0]}/>
      </>
    );
  }

  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 4, 8]} fov={50} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 6}
      />

      <Lighting />

      {/* Stars background */}
      <Stars
        radius={300}
        depth={60}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Celestial bodies */}
      <SpaceBody celestialBody={moonBody} position={[5,0,0]} />
      <SpaceBody celestialBody={earthBody} position={[-3, 0, 0]}/>

      {/* Flight path */}
      <FlightPath
        flightCurve={flightCurve}
        animationProgress={animationProgress}
        isAnimating={isAnimating}
        spacecraftPosition={spacecraftPosition}
      />

      {/* Artemis spacecraft */}
      <ArtemisSpacecraft
        onClick={onSpacecraftClick}
        onHover={handleSpacecraftHover}
        animationProgress={animationProgress}
        isAnimating={isAnimating}
        flightCurve={flightCurve}
        onPositionUpdate={handlePositionUpdate}
      />
    </>
  );
}

export default function ArtemisScene({
  onSpacecraftClick,
  onHoverChange,
  animationProgress,
  isAnimating
}: ArtemisSceneProps) {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 15, 40]} />

      <Scene
        onSpacecraftClick={onSpacecraftClick}
        onHoverChange={onHoverChange}
        animationProgress={animationProgress}
        isAnimating={isAnimating}
      />
    </Canvas>
  );
}
