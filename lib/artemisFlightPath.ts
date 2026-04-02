import * as THREE from 'three';

/**
 * Artemis I Flight Path Generator
 *
 * Uses pre-smoothed X,Z coordinates with computed Y values
 *
 * Flight segments (240 points total):
 * - Loop 1 (0-19): High helix, Y descends from start to mid
 * - Loop 2 (20-49): Continued descent to Y=0
 * - Loop 3 (50-89): Flat at Y=0
 * - Trans-lunar (90-139): Smooth arc to Moon
 * - Moon flyby (140-169): Figure-8 pattern
 * - Return (170-239): Arc back to Pacific
 *
 * Scene Parameters:
 * - Earth: position [-3, 0, 0], radius 1 unit
 * - Moon: position [5, 0, 0], radius 0.3 units
 */

const EARTH_POS = new THREE.Vector3(-3, 0, 0);
const MOON_POS = new THREE.Vector3(5, 0, 0);

// Configuration for Y-values (customizable)
const Y_CONFIG = {
  startHeight: 0.8,        // Starting height for Loop 1
  loop1EndHeight: 0.4,     // End of Loop 1
  loop2EndHeight: 0.0,     // End of Loop 2 (flat)
  transLunarPeak: 0.3,     // Peak height during trans-lunar
  returnPeak: 0.2,         // Peak height during return arc
  varianceAmplitude: 0.04, // Subtle sine wave variance
};

// Configuration for animation speed (customizable)
export const SPEED_CONFIG = {
  // Speed boost sections: spacecraft moves faster during these time ranges
  speedBoosts: [
    { startT: 0.15, endT: 0.25, multiplier: 1.9 },
    { startT: 0.4, endT: 0.45, multiplier: 1.5 },
    { startT: 0.65, endT: 0.75, multiplier: 1.8 },
  ],
  // Trail configuration
  trailLength: 10,  // Number of points in the red trail behind spacecraft
};

// Placeholder coordinates - will be set at runtime
let SMOOTHED_XZ_COORDS: [number, number][] = [];

/**
 * Load path coordinates from public/path.json
 */
export async function loadPathCoordinates(): Promise<[number, number][]> {
  if (SMOOTHED_XZ_COORDS.length > 0) {
    return SMOOTHED_XZ_COORDS;
  }

  try {
    const response = await fetch('/path.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch path.json: ${response.statusText}`);
    }

    const coords: [number, number][] = await response.json();
    SMOOTHED_XZ_COORDS = coords;
    console.log(`Loaded ${SMOOTHED_XZ_COORDS.length} flight path coordinates from path.json`);
    return SMOOTHED_XZ_COORDS;
  } catch (error) {
    console.error('Error loading path coordinates:', error);
    // Return minimal fallback path
    SMOOTHED_XZ_COORDS = [
      [-3.164500, 1.002500], [-3.136889, 1.022111], [-3.081667, 1.061333],
      [-2.947333, 1.064667], [-2.801778, 1.049667], [-2.645000, 1.016333],
    ];
    console.warn('Using fallback coordinates');
    return SMOOTHED_XZ_COORDS;
  }
}

export function setFlightPathCoordinates(coords: [number, number][]): void {
  SMOOTHED_XZ_COORDS = coords;
}

export function getFlightPathCoordinates(): [number, number][] {
  return SMOOTHED_XZ_COORDS;
}


interface PathSegment {
  startT: number;
  endT: number;
  numPoints: number;
  description: string;
}

const SEGMENTS: PathSegment[] = [
  { startT: 0.00, endT: 0.10, numPoints: 20, description: 'Loop 1 - High helix' },
  { startT: 0.10, endT: 0.25, numPoints: 30, description: 'Loop 2 - Descending' },
  { startT: 0.25, endT: 0.45, numPoints: 40, description: 'Loop 3 - Wide flat' },
  { startT: 0.45, endT: 0.70, numPoints: 50, description: 'Trans-lunar injection' },
  { startT: 0.70, endT: 0.85, numPoints: 30, description: 'Moon figure-8 flyby' },
  { startT: 0.85, endT: 1.00, numPoints: 70, description: 'Return to Pacific' },
];

/**
 * Calculate smooth Y coordinate for a point index
 */
function calculateYCoordinate(index: number, totalPoints: number): number {
  const { startHeight, loop1EndHeight, loop2EndHeight, transLunarPeak, returnPeak, varianceAmplitude } = Y_CONFIG;

  // Segment boundaries
  const loop1End = 19;
  const loop2End = 49;
  const loop3End = 89;
  const transLunarEnd = 139;
  const moonFlybyEnd = 169;

  let baseY = 0;

  if (index <= loop1End) {
    // Loop 1: Descend from startHeight to loop1EndHeight
    const t = index / loop1End;
    baseY = startHeight + (loop1EndHeight - startHeight) * t;
  } else if (index <= loop2End) {
    // Loop 2: Descend from loop1EndHeight to 0
    const t = (index - loop1End) / (loop2End - loop1End);
    baseY = loop1EndHeight + (loop2EndHeight - loop1EndHeight) * t;
  } else if (index <= loop3End) {
    // Loop 3: Flat at Y = 0
    baseY = 0;
  } else if (index <= transLunarEnd) {
    // Trans-lunar: Gentle arc upward then down
    const t = (index - loop3End) / (transLunarEnd - loop3End);
    baseY = transLunarPeak * Math.sin(t * Math.PI); // Sine arc
  } else if (index <= moonFlybyEnd) {
    // Moon flyby: Slight figure-8 wave
    const t = (index - transLunarEnd) / (moonFlybyEnd - transLunarEnd);
    baseY = 0.15 * Math.sin(t * Math.PI * 2); // Two waves for figure-8
  } else {
    // Return: Arc high then descend to Pacific
    const t = (index - moonFlybyEnd) / (totalPoints - 1 - moonFlybyEnd);
    baseY = returnPeak * Math.sin(t * Math.PI); // Parabolic arc
  }

  // Add subtle variance for visual interest
  const variance = varianceAmplitude * Math.sin(index * 0.3) * Math.cos(index * 0.17);

  return baseY + variance;
}

/**
 * Generate complete Artemis I flight path using smoothed coordinates
 */
export function generateArtemisFlightPath(): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < SMOOTHED_XZ_COORDS.length; i++) {
    const [x, z] = SMOOTHED_XZ_COORDS[i];
    const y = calculateYCoordinate(i, SMOOTHED_XZ_COORDS.length);

    points.push(new THREE.Vector3(x, y, z));
  }

  console.log(`Generated Artemis flight path with ${points.length} points`);

  return points;
}

/**
 * Create THREE.js curve from path points
 */
export function createFlightCurve(): THREE.CatmullRomCurve3 {
  const points = generateArtemisFlightPath();
  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
}

/**
 * Get position and orientation at time t (0-1)
 */
export interface FlightState {
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  quaternion: THREE.Quaternion;
}

export function getFlightState(curve: THREE.CatmullRomCurve3, t: number): FlightState {
  const position = curve.getPointAt(Math.max(0, Math.min(1, t)));
  const tangent = curve.getTangentAt(Math.max(0, Math.min(1, t))).normalize();

  // Create quaternion to orient spacecraft along tangent
  // Default GLB orientation is Y-up (0, 1, 0)
  const defaultUp = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion();

  // Orient Y-axis (up) along the tangent direction
  quaternion.setFromUnitVectors(defaultUp, tangent);

  return { position, tangent, quaternion };
}

/**
 * Get segment info for current time
 */
export function getCurrentSegment(t: number): PathSegment | null {
  return SEGMENTS.find(seg => t >= seg.startT && t <= seg.endT) || null;
}
