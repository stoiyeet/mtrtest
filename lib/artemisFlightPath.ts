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

// Smoothed X,Z coordinates from smoothed_points.txt (240 points)
const SMOOTHED_XZ_COORDS: [number, number][] = [
  [-3.164500, 1.002500], [-3.136889, 1.022111], [-3.081667, 1.061333], [-2.947333, 1.064667],
  [-2.801778, 1.049667], [-2.645000, 1.016333], [-2.477000, 0.964667], [-2.321667, 0.895556],
  [-2.179000, 0.809000], [-2.049000, 0.705000], [-1.949556, 0.584444], [-1.880667, 0.447333],
  [-1.842333, 0.293667], [-1.815778, 0.143444], [-1.801000, -0.003333], [-1.798000, -0.146667],
  [-1.816333, -0.301111], [-1.856000, -0.466667], [-1.917000, -0.643333], [-1.997889, -0.795222],
  [-2.098667, -0.922333], [-2.219333, -1.024667], [-2.351111, -1.105667], [-2.494000, -1.165333],
  [-2.648000, -1.203667], [-2.807222, -1.226778], [-2.971667, -1.234667], [-3.141333, -1.227333],
  [-3.298222, -1.199778], [-3.442333, -1.152000], [-3.573667, -1.084000], [-3.701222, -0.995222],
  [-3.825000, -0.885667], [-3.945000, -0.755333], [-4.043889, -0.619889], [-4.121667, -0.479333],
  [-4.178333, -0.333667], [-4.219556, -0.176778], [-4.245333, -0.008667], [-4.255667, 0.170667],
  [-4.245222, 0.346222], [-4.214000, 0.518000], [-4.162000, 0.686000], [-4.092250, 0.834583],
  [-4.004750, 0.963750], [-3.899500, 1.073500], [-3.794250, 1.183250], [-3.664750, 1.285250],
  [-3.511000, 1.379500], [-3.333000, 1.466000], [-3.155000, 1.552500], [-2.976000, 1.596900],
  [-2.796000, 1.599200], [-2.615000, 1.559400], [-2.434000, 1.519600], [-2.253000, 1.479800],
  [-2.087133, 1.420933], [-1.936400, 1.343000], [-1.800800, 1.246000], [-1.665200, 1.149000],
  [-1.529600, 1.052000], [-1.413067, 0.927200], [-1.315600, 0.774600], [-1.237200, 0.594200],
  [-1.158800, 0.413800], [-1.080400, 0.233400], [-1.025562, 0.052895], [-0.994286, -0.127714],
  [-0.986571, -0.308429], [-0.978857, -0.489143], [-0.971143, -0.669857], [-0.963429, -0.850571],
  [-0.955714, -1.031286], [-0.978071, -1.202817], [-1.030500, -1.365167], [-1.113000, -1.518333],
  [-1.195500, -1.671500], [-1.278000, -1.824667], [-1.360500, -1.977833], [-1.468100, -2.097411],
  [-1.600800, -2.183400], [-1.758600, -2.235800], [-1.916400, -2.288200], [-2.074200, -2.340600],
  [-2.233067, -2.373333], [-2.393000, -2.386400], [-2.554000, -2.379800], [-2.715000, -2.373200],
  [-2.876000, -2.366600], [-3.037833, -2.346478], [-3.200500, -2.312833], [-3.364000, -2.265667],
  [-3.527500, -2.218500], [-3.691000, -2.171333], [-3.854500, -2.124167], [-4.001750, -2.044139],
  [-4.132750, -1.931250], [-4.247500, -1.785500], [-4.362250, -1.639750], [-4.467283, -1.496583],
  [-4.562600, -1.356000], [-4.648200, -1.218000], [-4.733800, -1.080000], [-4.819400, -0.942000],
  [-4.867467, -0.850667], [-4.900000, -0.742083], [-4.917000, -0.616250], [-4.956000, -0.426500],
  [-4.995000, -0.236750], [-5.007250, -0.048167], [-4.992750, 0.139250], [-4.951500, 0.325500],
  [-4.910250, 0.511750], [-4.856083, 0.684000], [-4.789000, 0.842250], [-4.709000, 0.986500],
  [-4.629000, 1.130750], [-4.521000, 1.249717], [-4.385000, 1.343400], [-4.221000, 1.411800],
  [-4.057000, 1.480200], [-3.893000, 1.548600], [-3.726500, 1.606700], [-3.557500, 1.654500],
  [-3.386000, 1.692000], [-3.214500, 1.729500], [-3.043000, 1.767000], [-2.871500, 1.804500],
  [-2.693300, 1.814300], [-2.508400, 1.796400], [-2.316800, 1.750800], [-2.125200, 1.705200],
  [-1.933600, 1.659600], [-1.749343, 1.605105], [-1.572429, 1.541714], [-1.402857, 1.469429],
  [-1.233286, 1.397143], [-1.063714, 1.324857], [-0.894143, 1.252571], [-0.724571, 1.180286],
  [-0.552476, 1.106619], [-0.377857, 1.031571], [-0.200714, 0.955143], [-0.023571, 0.878714],
  [0.153571, 0.802286], [0.330714, 0.725857], [0.507857, 0.649429], [0.681619, 0.574254],
  [0.852000, 0.500333], [1.019000, 0.427667], [1.186000, 0.355000], [1.353000, 0.282333],
  [1.520000, 0.209667], [1.687000, 0.137000], [1.854000, 0.064333], [2.021000, -0.008333],
  [2.195333, -0.075069], [2.377000, -0.135875], [2.566000, -0.190750], [2.755000, -0.245625],
  [2.944000, -0.300500], [3.133000, -0.355375], [3.322000, -0.410250], [3.511000, -0.465125],
  [3.699208, -0.512125], [3.886625, -0.551250], [4.073250, -0.582500], [4.259875, -0.613750],
  [4.446500, -0.645000], [4.633125, -0.676250], [4.819750, -0.707500], [5.006375, -0.738750],
  [5.187958, -0.730667], [5.364500, -0.683250], [5.536000, -0.596500], [5.707500, -0.509750],
  [5.830500, -0.389694], [5.905000, -0.236333], [5.931000, -0.049667], [5.923000, 0.111667],
  [5.881000, 0.247667], [5.805000, 0.358333], [5.688778, 0.438778], [5.532333, 0.489000],
  [5.335667, 0.509000], [5.154556, 0.504583], [4.989000, 0.475750], [4.839000, 0.422500],
  [4.689000, 0.369250], [4.540833, 0.302417], [4.394500, 0.222000], [4.250000, 0.128000],
  [4.105500, 0.034000], [3.947700, -0.044067], [3.776600, -0.106200], [3.592200, -0.152400],
  [3.407800, -0.198600], [3.223400, -0.244800], [3.040800, -0.292867], [2.860000, -0.342800],
  [2.681000, -0.394600], [2.502000, -0.446400], [2.323000, -0.498200], [2.146762, -0.551114],
  [1.973286, -0.605143], [1.802571, -0.660286], [1.631857, -0.715429], [1.461143, -0.770571],
  [1.290429, -0.825714], [1.119714, -0.880857], [0.948857, -0.941143], [0.777857, -1.006571],
  [0.606714, -1.077143], [0.435571, -1.147714], [0.264429, -1.218286], [0.093286, -1.288857],
  [-0.077857, -1.359429], [-0.247619, -1.426238], [-0.416000, -1.489286], [-0.583000, -1.548571],
  [-0.750000, -1.607857], [-0.917000, -1.667143], [-1.084000, -1.726429], [-1.251000, -1.785714],
  [-1.419905, -1.827095], [-1.590714, -1.850571], [-1.763429, -1.856143], [-1.936143, -1.861714],
  [-2.108857, -1.867286], [-2.281571, -1.872857], [-2.454286, -1.878429], [-2.622179, -1.855643],
  [-2.785250, -1.804500], [-2.943500, -1.725000], [-3.101750, -1.645500], [-3.226361, -1.541167],
  [-3.317333, -1.412000], [-3.374667, -1.258000], [-3.403333, -1.181000]
];

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
