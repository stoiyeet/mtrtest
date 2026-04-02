'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, useGLTF, useTexture, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import {earthBody, moonBody} from "@/lib/CelestialBodies"
import SpaceBody from "@/components/SpaceBody";


interface ArtemisSceneProps {
  onSpacecraftClick: () => void;
  onHoverChange: (object: string | null) => void;
}

// Preload the Artemis model
useGLTF.preload('https://glb.asteroidstrike.earth/artemis1.glb');



function ArtemisSpacecraft({ onClick, onHover }: { onClick: () => void; onHover: (hovered: boolean) => void }) {
  const { scene } = useGLTF('https://glb.asteroidstrike.earth/artemis1.glb');
  const spacecraftRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Clone the scene to avoid issues with multiple instances
  const clonedScene = scene.clone();

  useFrame((state) => {
    if (spacecraftRef.current) {
      // Gentle floating animation
      spacecraftRef.current.position.y = 3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      spacecraftRef.current.rotation.y += 0.003;

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
      position={[4, 3, 2]}
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

function Scene({ onSpacecraftClick, onHoverChange }: ArtemisSceneProps) {
  const handleSpacecraftHover = (hovered: boolean) => {
    onHoverChange(hovered ? 'Artemis Spacecraft' : null);
  };

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
      <SpaceBody celestialBody={moonBody} position={[0,0,0]} />

      <SpaceBody celestialBody={earthBody} position={[-15, 2, -8]}/>
      {/* Artemis spacecraft */}
      <ArtemisSpacecraft
        onClick={onSpacecraftClick}
        onHover={handleSpacecraftHover}
      />
    </>
  );
}

export default function ArtemisScene({ onSpacecraftClick, onHoverChange }: ArtemisSceneProps) {
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
      />
    </Canvas>
  );
}
