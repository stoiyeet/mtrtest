import {CelestialBody} from "./impactTypes";

export const earthBody: CelestialBody = {
    name: "Earth",

    // Physical constants

    gravity: 9.81,
    radius_M: 6371000,
    Volume_KM3: 1.083e12,
    Diameter_M: 12756e3,
    hasAtmosphere: true,
    hasWater: true,

    // Tunable constants

    // Feature flags (controls which effects run)
    features: {
        thermal: true,
        seismic: true,
        waveblast: true,
    }
}

export const moonBody: CelestialBody = {
    name: "Moon",
    gravity: 1.62,
    radius_M: 1737100,
    Volume_KM3: 2.1958e10,
    Diameter_M: 3474000,
    hasAtmosphere: false,
    hasWater: false,
    features: {
        thermal: true,
        seismic: true,
        waveblast: false,
    }
};