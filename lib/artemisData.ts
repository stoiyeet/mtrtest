/**
 * Artemis Program Information
 * Structured data for dynamic display without cluttering the main interface
 */

export interface ArtemisMission {
  name: string;
  date: string;
  crewed: boolean;
  crew?: string[];
  objectives: string[];
  hardware: string[];
  facts: string[];
}

export interface ArtemisInfo {
  missions: ArtemisMission[];
  hardware: Record<string, string>;
  crew: Record<string, string>;
  timeline: {
    year: number;
    milestones: string[];
  }[];
}

export const artemisData: ArtemisInfo = {
  missions: [
    {
      name: "Artemis I",
      date: "Nov 16, 2022",
      crewed: false,
      objectives: [
        "Test SLS and Orion systems",
        "Fly 1.4 million miles beyond the Moon",
        "Validate heat shields and deep-space systems"
      ],
      hardware: ["Space Launch System (SLS)", "Orion spacecraft"],
      facts: [
        "First integrated SLS/Orion flight test",
        "25-day uncrewed lunar flight",
        "Tested all critical systems for crewed missions"
      ]
    },
    {
      name: "Artemis II",
      date: "Apr 1, 2026",
      crewed: true,
      crew: [
        "Reid Wiseman (Commander) - NASA",
        "Victor Glover (Pilot) - NASA",
        "Christina Koch (Mission Specialist) - NASA",
        "Jeremy Hansen (Mission Specialist) - CSA"
      ],
      objectives: [
        "First crewed flight of SLS and Orion",
        "Validate life support and communications with humans aboard",
        "Lunar flyby and far-side science observations",
        "10-day mission 300,000+ miles around the Moon"
      ],
      hardware: ["Space Launch System (SLS)", "Orion spacecraft"],
      facts: [
        "Jeremy Hansen becomes the first Canadian to venture beyond low Earth orbit",
        "Christina Koch holds the record for longest single spaceflight by a woman (328 days)",
        "All four are veteran explorers with extensive space experience"
      ]
    },
    {
      name: "Artemis III",
      date: "2027",
      crewed: true,
      objectives: [
        "Rendezvous and dock with commercial lunar lander in orbit",
        "Test lunar landing system docking procedures",
        "Preparation for Artemis IV crewed landing"
      ],
      hardware: ["SLS", "Orion", "Starship HLS (SpaceX)"],
      facts: [
        "Added in 2026 to increase flight cadence and reduce risk",
        "Orbits with lander rather than landing",
        "Critical demonstration mission for future crewed landings"
      ]
    },
    {
      name: "Artemis IV",
      date: "Early 2028",
      crewed: true,
      objectives: [
        "First crewed lunar landing of Artemis",
        "Land at the Moon's South Pole",
        "~1 week surface stay with 2 astronauts",
        "Conduct science experiments and collect samples"
      ],
      hardware: ["SLS", "Orion", "Starship HLS (SpaceX)", "Lunar equipment"],
      facts: [
        "Will land the first woman on the Moon",
        "Will land the first person of color on the Moon",
        "South Pole rich in water ice and ancient rocks"
      ]
    },
    {
      name: "Artemis V",
      date: "Late 2028",
      crewed: true,
      objectives: [
        "Sustained lunar presence and Gateway expansion",
        "Crewed landing at South Pole (2 astronauts)",
        "Deploy Gateway modules and infrastructure",
        "Test reusable lander systems"
      ],
      hardware: ["SLS", "Orion", "Blue Moon HLS (Blue Origin)", "Gateway station"],
      facts: [
        "Uses Blue Origin's Blue Moon lander",
        "Week-long South Pole visit",
        "Demonstrates habitat and refueling concepts for multiple landings"
      ]
    }
  ],
  hardware: {
    SLS: "Space Launch System - Super-heavy lift rocket capable of sending Orion and crew to the Moon in a single launch",
    Orion: "Crew capsule with European-built Service Module that sustains astronauts in deep space",
    Gateway: "Small space station in lunar orbit built with international partners (ESA, JAXA, CSA)",
    Starship: "SpaceX-developed lunar lander for Artemis III and IV missions",
    "Blue Moon": "Blue Origin's lunar lander for Artemis V and beyond",
    Canadarm3: "Robotic arm provided by Canada for Gateway maintenance"
  },
  crew: {
    "Reid Wiseman": "Commander - Former Navy test pilot, 165 days on ISS in 2014",
    "Victor Glover": "Pilot - Piloted SpaceX Crew-1 to ISS, 168 days in orbit",
    "Christina Koch": "Mission Specialist - Holds record for longest female spaceflight (328 days), performs all-female spacewalks",
    "Jeremy Hansen": "Mission Specialist - Former fighter pilot, first Canadian beyond low Earth orbit"
  },
  timeline: [
    {
      year: 2022,
      milestones: [
        "Artemis I launches Nov 16",
        "Uncrewed flyby of Moon completed"
      ]
    },
    {
      year: 2026,
      milestones: [
        "Artemis II launches Apr 1 with 4-person crew",
        "First humans aboard SLS and Orion",
        "10-day lunar flyby mission"
      ]
    },
    {
      year: 2027,
      milestones: [
        "Artemis III orbital demonstration",
        "Commercial lander docking test in lunar orbit"
      ]
    },
    {
      year: 2028,
      milestones: [
        "Artemis IV - First crewed lunar landing",
        "Artemis V - Sustained presence at South Pole",
        "Annual mission cadence begins"
      ]
    }
  ]
};

/**
 * Get a concise summary of the Artemis program
 */
export function getArtemisSummary(): string {
  return `NASA's Artemis program returns astronauts to the Moon as a stepping-stone to Mars. 
Artemis II (Apr 2026) launches four astronauts on a 10-day crewed loop around the Moon. 
Future missions will land the first woman and person of color on the Moon's South Pole.
The program builds a sustained lunar presence through international partnerships and commercial services.`;
}

/**
 * Get details about a specific mission
 */
export function getMissionDetails(missionName: string): ArtemisMission | undefined {
  return artemisData.missions.find(m => m.name.toLowerCase() === missionName.toLowerCase());
}

/**
 * Get current Artemis status (as of April 2026)
 */
export function getArtemisStatus(): string {
  return "Artemis II successfully launched on April 1, 2026. The first crewed flight on NASA's new Moon rocket is underway. The next milestone is Artemis III in 2027, with the first crewed lunar landing (Artemis IV) targeted for early 2028.";
}
