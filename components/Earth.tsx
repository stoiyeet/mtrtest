// components/Earth.tsx

import * as THREE from 'three';
import React, { useRef, useMemo } from 'react';
import { useLoader, ThreeEvent } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { CelestialBody } from '@/lib/impactTypes';
import Clouds from './Clouds';

interface EarthProps {
  onDoubleClick: (event: ThreeEvent<PointerEvent>) => void;
  showClouds?: boolean;
  cloudIntensity?: number;
  impactPosition?: THREE.Vector3 | null;
  blastRadius?: number;
  explosionStrength?: number;
  celestialBody?: CelestialBody;
}

const EARTH_R = 1;

/**
 * Generic celestial body renderer that adapts to any body's properties
 * Supports textured bodies (Earth) and untextured rocky bodies (Moon)
 */
export default function Earth({
  onDoubleClick,
  showClouds = true,
  cloudIntensity = 0.8,
  impactPosition = null,
  blastRadius = 0,
  explosionStrength = 0,
  celestialBody,
}: EarthProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  // Use config from celestialBody or provide sensible defaults
  const hasTextures = celestialBody?.textureUrls?.day ? true : false;
  const materialConfig = celestialBody?.materialConfig || {
    shininess: 10,
    bumpScale: 0,
    emissiveIntensity: 0.3,
    cloudIntensity: 0,
  };
  const atmosphereConfig = celestialBody?.atmosphereColors || {
    inner: '#222222',
    outer: '#444444',
    innerOpacity: 0,
    outerOpacity: 0,
  };
  const showAtmosphere = (celestialBody?.hasAtmosphere ?? false) && 
                        (atmosphereConfig.innerOpacity > 0 || atmosphereConfig.outerOpacity > 0);

  // Conditionally load textures
  let dayTex, normalTex, specularTex;
  
  if (hasTextures && celestialBody?.textureUrls) {
    dayTex = useLoader(TextureLoader, celestialBody.textureUrls.day);
    if (celestialBody.textureUrls.normal) {
      normalTex = useLoader(TextureLoader, celestialBody.textureUrls.normal);
    }
    if (celestialBody.textureUrls.specular) {
      specularTex = useLoader(TextureLoader, celestialBody.textureUrls.specular);
    }

    // Configure texture color spaces
    if (dayTex) dayTex.colorSpace = THREE.SRGBColorSpace;
    if (normalTex) normalTex.colorSpace = THREE.LinearSRGBColorSpace;
    if (specularTex) specularTex.colorSpace = THREE.LinearSRGBColorSpace;
  }

  // Memoize the effective cloud intensity
  const effectiveCloudIntensity = useMemo(() => {
    return showClouds ? (materialConfig.cloudIntensity ?? 0.8) : 0;
  }, [showClouds, materialConfig.cloudIntensity]);

  return (
    <group>
      {/* Main Celestial Body Mesh */}
      <mesh ref={meshRef} onDoubleClick={onDoubleClick} receiveShadow castShadow>
        <sphereGeometry args={[EARTH_R, 128, 128]} />
        
        {hasTextures && dayTex ? (
          // Textured body (e.g., Earth)
          <meshPhongMaterial
            map={dayTex}
            normalMap={normalTex || undefined}
            normalScale={normalTex ? new THREE.Vector2(0.6, 0.6) : new THREE.Vector2(0, 0)}
            specularMap={specularTex || undefined}
            specular={specularTex ? 0x444444 : 0x1a1a1a}
            shininess={materialConfig.shininess}
            bumpScale={materialConfig.bumpScale}
            emissive={0x101010}
            emissiveIntensity={materialConfig.emissiveIntensity}
          />
        ) : (
          // Untextured body (e.g., Moon) - simple grey rocky material
          <meshPhongMaterial
            color={0x888888}
            specular={0x333333}
            shininess={materialConfig.shininess}
            emissive={0x0a0a0a}
            emissiveIntensity={materialConfig.emissiveIntensity}
          />
        )}
      </mesh>

      {/* Atmospheric Glow Layers - only for bodies with atmosphere */}
      {showAtmosphere && (
        <>
          {/* Inner atmosphere glow - closer, more colored */}
          <mesh>
            <sphereGeometry args={[EARTH_R * 1.008, 64, 64]} />
            <meshBasicMaterial 
              color={atmosphereConfig.inner} 
              transparent 
              opacity={atmosphereConfig.innerOpacity} 
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>

          {/* Outer atmosphere glow - further, subtle */}
          <mesh>
            <sphereGeometry args={[EARTH_R * 1.015, 32, 32]} />
            <meshBasicMaterial 
              color={atmosphereConfig.outer} 
              transparent 
              opacity={atmosphereConfig.outerOpacity} 
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>
        </>
      )}

      {/* Dynamic Clouds - only for bodies with atmosphere and water */}
      {celestialBody?.hasAtmosphere && celestialBody?.hasWater && effectiveCloudIntensity > 0 && (
        <Clouds
          intensity={effectiveCloudIntensity}
          impactPosition={impactPosition}
          blastRadius={blastRadius}
          explosionStrength={explosionStrength}
        />
      )}
    </group>
  );
}