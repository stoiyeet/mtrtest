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
 * Generate a circular loop around Earth at specified altitude and inclination
 */
function generateEarthLoop(
  radius: number,
  numPoints: number,
  startAngle: number,
  inclination: number, // 0 = equatorial, PI/2 = polar
  phaseOffset: number = 0
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = startAngle + (Math.PI * 2 * i) / numPoints;

    // Create point in orbital plane
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle) * Math.sin(inclination);
    const z = radius * Math.sin(angle) * Math.cos(inclination);

    // Rotate around Earth's axis for phase offset
    const cosP = Math.cos(phaseOffset);
    const sinP = Math.sin(phaseOffset);
    const rotatedX = x * cosP - z * sinP;
    const rotatedZ = x * sinP + z * cosP;

    // Translate to Earth's position
    points.push(new THREE.Vector3(
      EARTH_POS.x + rotatedX,
      EARTH_POS.y + y,
      EARTH_POS.z + rotatedZ
    ));
  }

  return points;
}

/**
 * Generate Moon flyby arc around far side
 */
function generateMoonFlyby(numPoints: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const flybyRadius = 0.6; // 0.6 units from Moon center (double Moon's radius)

  // Arc from ~120° to ~240° (far side, away from Earth)
  const startAngle = (2 * Math.PI) / 3; // 120°
  const endAngle = (4 * Math.PI) / 3; // 240°

  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const angle = startAngle + (endAngle - startAngle) * t;

    // Circular arc in XY plane
    const x = flybyRadius * Math.cos(angle);
    const y = flybyRadius * Math.sin(angle) * 0.3; // Slight vertical component
    const z = flybyRadius * Math.sin(angle);

    points.push(new THREE.Vector3(
      MOON_POS.x + x,
      MOON_POS.y + y,
      MOON_POS.z + z
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

  // SEGMENT 1: Loop 1 - Narrow, high latitude (top quartile)
  // Radius: 1.5 Earth radii, high inclination
  const loop1 = generateEarthLoop(
    EARTH_RADIUS * 1.5,
    20,
    0, // Start at 0°
    Math.PI / 3, // 60° inclination (top quartile)
    0
  );
  allPoints.push(...loop1);

  // SEGMENT 2: Loop 2 - Medium, equatorial
  // Radius: 2 Earth radii, lower inclination
  const loop2Start = loop1[loop1.length - 1];
  const loop2Points = generateEarthLoop(
    EARTH_RADIUS * 2.0,
    30,
    Math.PI * 0.2, // Offset start angle
    Math.PI / 6, // 30° inclination (more equatorial)
    Math.PI / 4 // Phase rotation
  );

  // Smooth transition from loop1 to loop2
  const transition1 = generateTransition(
    loop2Start,
    loop2Points[0],
    5,
    new THREE.Vector3(0, 0.5, 0.5),
    new THREE.Vector3(0, -0.3, -0.3)
  );
  allPoints.push(...transition1.slice(1)); // Skip duplicate first point
  allPoints.push(...loop2Points);

  // SEGMENT 3: Loop 3 - Wide, preparing for trans-lunar injection
  // Radius: 3 Earth radii (1R above surface), nearly equatorial
  const loop3Start = loop2Points[loop2Points.length - 1];
  const loop3Points = generateEarthLoop(
    EARTH_RADIUS * 3.0,
    40,
    Math.PI * 0.5,
    Math.PI / 12, // 15° inclination (nearly equatorial)
    Math.PI / 2 // Different phase
  );

  const transition2 = generateTransition(
    loop3Start,
    loop3Points[0],
    5,
    new THREE.Vector3(0.5, 0, 1),
    new THREE.Vector3(-0.5, 0, -0.5)
  );
  allPoints.push(...transition2.slice(1));
  allPoints.push(...loop3Points);

  // SEGMENT 4: Trans-Lunar Injection
  // Smooth curve from Earth orbit to Moon vicinity
  const tliStart = loop3Points[loop3Points.length - 1];
  const moonApproach = new THREE.Vector3(
    MOON_POS.x - 1.5, // Approach from Earth side
    MOON_POS.y + 0.5,
    MOON_POS.z - 1
  );

  const tliCurve = generateTransition(
    tliStart,
    moonApproach,
    50,
    new THREE.Vector3(2, 1, 0), // Control point pushes outward and up
    new THREE.Vector3(-0.5, 0.3, 0.5) // Control point near Moon
  );
  allPoints.push(...tliCurve.slice(1));

  // SEGMENT 5: Moon Far Side Flyby
  const moonFlyby = generateMoonFlyby(30);

  // Transition to flyby
  const transition4 = generateTransition(
    moonApproach,
    moonFlyby[0],
    5,
    new THREE.Vector3(0.3, 0, 0.3),
    new THREE.Vector3(-0.2, 0, -0.2)
  );
  allPoints.push(...transition4.slice(1));
  allPoints.push(...moonFlyby);

  // SEGMENT 6: Return to Pacific Ocean (Earth)
  const returnStart = moonFlyby[moonFlyby.length - 1];
  const pacificEntry = new THREE.Vector3(
    EARTH_POS.x - 0.5, // Approach from slightly offset angle
    EARTH_POS.y - 0.3, // Descending
    EARTH_POS.z + 1.2  // Pacific side (positive Z)
  );

  const returnCurve = generateTransition(
    returnStart,
    pacificEntry,
    30,
    new THREE.Vector3(-1, 0.2, 0.5), // Arc high and away
    new THREE.Vector3(0.2, -0.5, -0.3) // Descend toward Pacific
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
