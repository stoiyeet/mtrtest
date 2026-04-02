import * as THREE from 'three';

/**
 * Artemis I Flight Path Generator
 *
 * Mission Profile:
 * - 3 Earth loops: narrow → medium → wide (1.5R, 2R, 3R altitudes)
 * - Trans-lunar injection to Moon
 * - Far side flyby
 * - Return trajectory to Pacific Ocean
 *
 * Scene Parameters:
 * - Earth: position [-3, 0, 0], radius 1 unit
 * - Moon: position [5, 0, 0], radius 0.3 units
 * - Total points: 200+
 * - Duration: 30 seconds
 */

const EARTH_POS = new THREE.Vector3(-3, 0, 0);
const MOON_POS = new THREE.Vector3(5, 0, 0);
const EARTH_RADIUS = 1;
const MOON_RADIUS = 0.3;

interface PathSegment {
  startT: number;
  endT: number;
  numPoints: number;
  description: string;
}

const SEGMENTS: PathSegment[] = [
  { startT: 0.00, endT: 0.10, numPoints: 20, description: 'Loop 1 - High latitude' },
  { startT: 0.10, endT: 0.25, numPoints: 30, description: 'Loop 2 - Equatorial' },
  { startT: 0.25, endT: 0.45, numPoints: 40, description: 'Loop 3 - Wide slingshot' },
  { startT: 0.45, endT: 0.70, numPoints: 50, description: 'Trans-lunar injection' },
  { startT: 0.70, endT: 0.85, numPoints: 30, description: 'Moon far side flyby' },
  { startT: 0.85, endT: 1.00, numPoints: 30, description: 'Return to Pacific' },
];

/**
 * Generate a helix around Earth (descending spiral)
 */
function generateHelix(
  radius: number,
  numPoints: number,
  startHeight: number,
  endHeight: number,
  numTurns: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const angle = numTurns * Math.PI * 2 * t;

    // Helix around Earth
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    const y = startHeight + (endHeight - startHeight) * t;

    // Translate to Earth's position
    points.push(new THREE.Vector3(
      EARTH_POS.x + x,
      y,
      EARTH_POS.z + z
    ));
  }

  return points;
}

/**
 * Generate a flat circular orbit around Earth
 */
function generateCircularOrbit(
  radius: number,
  numPoints: number,
  height: number,
  startAngle: number = 0
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = startAngle + (Math.PI * 2 * i) / numPoints;

    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);

    points.push(new THREE.Vector3(
      EARTH_POS.x + x,
      height,
      EARTH_POS.z + z
    ));
  }

  return points;
}

/**
 * Generate Moon flyby arc around far side at [5, 0, 0]
 */
function generateMoonFlyby(numPoints: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const flybyRadius = 1; // 0.6 units from Moon center (double Moon's radius)

  // Arc from ~120° to ~240° (far side, away from Earth at negative X)
  const startAngle = (2 * Math.PI) / 3; // 120°
  const endAngle = (4 * Math.PI) / 3; // 240°

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const angle = startAngle + (endAngle - startAngle) * t;

    // Circular arc around Moon in XZ plane (mostly flat)
    const x = flybyRadius * Math.cos(angle);
    const z = flybyRadius * Math.sin(angle);
    const y = 0.1 * Math.sin(t * Math.PI); // Slight vertical wave

    points.push(new THREE.Vector3(
      MOON_POS.x - x,
      y,
      MOON_POS.z - z
    ));
  }

  return points;
}

/**
 * Generate smooth transition curve between two points
 */
function generateTransition(
  start: THREE.Vector3,
  end: THREE.Vector3,
  numPoints: number,
  controlOffset1: THREE.Vector3,
  controlOffset2: THREE.Vector3
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  // Create Bezier curve with two control points
  const p0 = start;
  const p1 = start.clone().add(controlOffset1);
  const p2 = end.clone().add(controlOffset2);
  const p3 = end;

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;

    // Cubic Bezier formula
    const point = new THREE.Vector3(
      mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
      mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
      mt3 * p0.z + 3 * mt2 * t * p1.z + 3 * mt * t2 * p2.z + t3 * p3.z
    );

    points.push(point);
  }

  return points;
}

/**
 * Generate complete Artemis I flight path
 */
export function generateArtemisFlightPath(): THREE.Vector3[] {
  const allPoints: THREE.Vector3[] = [];

  // SEGMENT 1: Loop 1 - High helix (1 turn, descending from Y=2 to Y=1)
  const loop1 = generateHelix(
    EARTH_RADIUS * 1.3,
    20,
    0.7,  // start at Y = 2
    0.4,  // end at Y = 1
    1     // 1 full turn
  );
  allPoints.push(...loop1);

  const loop2 = generateHelix(
    EARTH_RADIUS * 2.0,  // radius 2.0 (wider)
    30,
    0.4,  // start at Y = 1
    0.0,  // end at Y = 0
    1     // 1 full turn
  );
  allPoints.push(...loop2);

  // SEGMENT 3: Loop 3 - Flat wide circle at Y=0
  const loop3 = generateCircularOrbit(
    EARTH_RADIUS * 3.0,  // radius 3.0 (widest)
    40,
    0.0  // flat at Y = 0
  );
  allPoints.push(...loop3);

  // SEGMENT 4: Trans-Lunar Injection - shoot toward Moon
  const tliStart = loop3[loop3.length - 1];
  const moonApproach = new THREE.Vector3(
    MOON_POS.x - 0.8,  // Approach from Earth side
    0.3,               // Slight upward
    MOON_POS.z - 0.5
  );

  const tliCurve = generateTransition(
    tliStart,
    moonApproach,
    50,
    new THREE.Vector3(2, 0.5, 0),     // Push away from Earth and up
    new THREE.Vector3(-0.5, 0.2, 0.3)  // Approach Moon
  );
  allPoints.push(...tliCurve.slice(1));

  // SEGMENT 5: Moon Far Side Flyby
  const moonFlyby = generateMoonFlyby(30);
  allPoints.push(...moonFlyby);

  // SEGMENT 6: Return to Pacific Ocean (Earth) - higher Y for splashdown
  const returnStart = moonFlyby[moonFlyby.length - 1];
  const pacificEntry = new THREE.Vector3(
    EARTH_POS.x - 0.3,  // Pacific side of Earth
    0.8,                // Higher Y for descent angle
    EARTH_POS.z + 1.5   // Positive Z (Pacific)
  );

  const returnCurve = generateTransition(
    returnStart,
    pacificEntry,
    30,
    new THREE.Vector3(-1, 0.5, 0.5),   // Arc away from Moon
    new THREE.Vector3(0.3, -0.3, -0.5) // Descend to Pacific
  );
  allPoints.push(...returnCurve.slice(1));

  console.log(`Generated Artemis flight path with ${allPoints.length} points`);

  return allPoints;
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
