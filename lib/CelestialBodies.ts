import {CelestialBody} from "./impactTypes";

export const earthBody: CelestialBody = {
    name: "Earth",
    scale: 1,

    // Physical constants
    gravity: 9.81,
    radius_M: 6371000,
    Volume_KM3: 1.083e12,
    Diameter_M: 12756e3,
    hasAtmosphere: true,
    hasWater: true,

    // Rendering properties
    textureUrls: {
        day: 'https://glb.asteroidstrike.earth/textures/earthDay2.png',
        normal: 'https://glb.asteroidstrike.earth/textures/earthNormal.png',
        specular: 'https://glb.asteroidstrike.earth/textures/earthSpecular.png',
    },
    materialConfig: {
        shininess: 25,
        bumpScale: 0.03,
        emissiveIntensity: 0.5,
        cloudIntensity: 0.8,
    },
    atmosphereColors: {
        inner: '#4a90e2',
        outer: '#88ccff',
        innerOpacity: 0.2,
        outerOpacity: 0.1,
    },

    // Feature flags (controls which effects run)
    features: {
        thermal: true,
        seismic: true,
        waveblast: true,
    }
};

export const moonBody: CelestialBody = {
    name: "Moon",
    scale: 0.3,
    gravity: 1.62,
    radius_M: 1737100,
    Volume_KM3: 2.1958e10,
    Diameter_M: 3474000,
    hasAtmosphere: false,
    hasWater: false,

    // Rendering properties
    textureUrls: {
        day: 'https://glb.asteroidstrike.earth/textures/Moon.png',
        normal: null,
        specular: null,
    },
    materialConfig: {
        shininess: 10,
        bumpScale: 0,
        emissiveIntensity: 0.3,
        cloudIntensity: 0,
    },
    atmosphereColors: {
        inner: '#222222',
        outer: '#444444',
        innerOpacity: 0,
        outerOpacity: 0,
    },

    // Feature flags
    features: {
        thermal: true,
        seismic: true,
        waveblast: false,
    }
};