"use client";
import React, { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

interface AsteroidProps {
  orbitRadius?: number;   // distance from Earth
  orbitSpeed?: number;    // angular speed
  earthPosition?: [number, number, number]; // Earth's world position
}

const Asteroid: React.FC<AsteroidProps> = ({
  orbitRadius = 8,
  orbitSpeed = 0.2,
  earthPosition = [50, 0, 0],
}) => {
  const pivotRef = useRef<THREE.Group>(null!); // orbit pivot
  const meshRef = useRef<THREE.Mesh>(null!);

  const map = useLoader(THREE.TextureLoader, "/textures/Asteroid.png");

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map,
        roughness: 0.95,
        metalness: 0.05,
      }),
    [map]
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Orbit around Earth
    if (pivotRef.current) {
      pivotRef.current.rotation.y = t * orbitSpeed; // spin around Y axis
    }

    // Spin asteroid itself
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.x += 0.005;
    }
  });

  return (
    <group ref={pivotRef} position={earthPosition}>
      <mesh
        ref={meshRef}
        position={[orbitRadius, 0, 0]} // offset asteroid from Earth
        castShadow
        receiveShadow
        material={material}
      >
        <dodecahedronGeometry args={[1, 2]} />
      </mesh>
    </group>
  );
};

export default Asteroid;
