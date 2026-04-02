// components/SpaceBody.tsx

import * as THREE from 'three';
import React, { useRef, useMemo } from 'react';
import { useLoader, ThreeEvent } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { CelestialBody } from '@/lib/impactTypes';
import Clouds from './Clouds';

interface EarthProps {
  onDoubleClick?: (event: ThreeEvent<PointerEvent>) => void;
  position?: [number, number, number]
  showClouds?: boolean;
  cloudIntensity?: number;
  impactPosition?: THREE.Vector3 | null;
  blastRadius?: number;
  explosionStrength?: number;
  celestialBody: CelestialBody;
}

/**
 * Generic celestial body renderer that adapts to any body's properties
 * Supports textured bodies (Earth) and untextured rocky bodies (Moon)
 */
export default function SpaceBody({
  onDoubleClick,
  position,
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

  // Use a small data URL as fallback to maintain hook call order
  const FALLBACK_TEXTURE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  // Always call hooks unconditionally with fallback textures
  const dayTexUrl = hasTextures && celestialBody?.textureUrls?.day
    ? celestialBody.textureUrls.day
    : FALLBACK_TEXTURE;
  const normalTexUrl = hasTextures && celestialBody?.textureUrls?.normal
    ? celestialBody.textureUrls.normal
    : FALLBACK_TEXTURE;
  const specularTexUrl = hasTextures && celestialBody?.textureUrls?.specular
    ? celestialBody.textureUrls.specular
    : FALLBACK_TEXTURE;

  // Always load all three textures (hooks must be called unconditionally)
  const dayTex = useLoader(TextureLoader, dayTexUrl);
  const normalTex = useLoader(TextureLoader, normalTexUrl);
  const specularTex = useLoader(TextureLoader, specularTexUrl);

  // Configure texture color spaces
  if (hasTextures && celestialBody?.textureUrls?.day) {
    dayTex.colorSpace = THREE.SRGBColorSpace;
  }
  if (hasTextures && celestialBody?.textureUrls?.normal) {
    normalTex.colorSpace = THREE.LinearSRGBColorSpace;
  }
  if (hasTextures && celestialBody?.textureUrls?.specular) {
    specularTex.colorSpace = THREE.LinearSRGBColorSpace;
  }

  // Memoize the effective cloud intensity
  const effectiveCloudIntensity = useMemo(() => {
    return showClouds ? (materialConfig.cloudIntensity ?? 0.8) : 0;
  }, [showClouds, materialConfig.cloudIntensity]);

  return (
    <group position={position}>
      {/* Main Celestial Body Mesh */}
      <mesh ref={meshRef} onDoubleClick={onDoubleClick} receiveShadow castShadow>
        <sphereGeometry args={[celestialBody.scale, 128, 128]} />
        
        {hasTextures && celestialBody?.textureUrls?.day ? (
          // Textured body (e.g., Earth)
          <meshPhongMaterial
            map={dayTex}
            normalMap={celestialBody?.textureUrls?.normal ? normalTex : undefined}
            normalScale={celestialBody?.textureUrls?.normal ? new THREE.Vector2(0.6, 0.6) : new THREE.Vector2(0, 0)}
            specularMap={celestialBody?.textureUrls?.specular ? specularTex : undefined}
            specular={celestialBody?.textureUrls?.specular ? 0x444444 : 0x1a1a1a}
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
            <sphereGeometry args={[celestialBody.scale * 1.008, 64, 64]} />
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
            <sphereGeometry args={[celestialBody.scale * 1.015, 32, 32]} />
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