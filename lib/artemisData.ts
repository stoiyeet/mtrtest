/**
 * Artemis II Mission Briefing
 * High-impact crew profiles and mission data
 */

export interface CrewMember {
  name: string;
  role: string;
  agency: string;
  image: string;
  callsign?: string;
  headline: string;
  bio: string[];
  achievements: string[];
}

export interface MissionBrief {
  title: string;
  tagline: string;
  launchDate: string;
  duration: string;
  highlights: string[];
  significance: string;
  nextSteps: string[];
}

export interface ArtemisInfo {
  crew: CrewMember[];
  mission: MissionBrief;
}

export const artemisData: ArtemisInfo = {
  crew: [
    {
      name: "Reid Wiseman",
      role: "Commander",
      agency: "NASA",
      image: "/images/ReidWiseman.jpg",
      headline: "The oldest human to ever leave Earth orbit",
      bio: [
        "Navy Captain and test pilot with 165 days in orbit. Master's in Systems Engineering from Johns Hopkins.",
        "At age 50, Wiseman shattered a 50-year-old record as the oldest human to venture beyond Low Earth Orbit.",
        "Former Chief of the Astronaut Office, who managed the entire U.S. astronaut corps before commanding the first lunar mission of the 21st century."
      ],
      achievements: [
        "165 days on ISS",
        "Former Chief of Astronaut Office",
        "Oldest person in deep space (age 50)"
      ]
    },
    {
      name: "Victor Glover",
      role: "Pilot",
      agency: "NASA",
      image: "/images/VictorGlover.jpg",
      callsign: "IKE",
      headline: "First person of color to pilot a spacecraft to the Moon",
      bio: [
        "Apex aviator with 3,000+ flight hours and 400 carrier landings. Holds three master's degrees including Flight Test Engineering and Systems Engineering.",
        "Former NCAA Division I wrestler and football star for the Cal Poly Mustangs. Call sign: \"IKE\" (short for \"I Know Everything\").",
        "Piloted the first operational SpaceX Crew Dragon mission. Now the first person of color to pilot a spacecraft to the Moon."
      ],
      achievements: [
        "3,000+ flight hours",
        "3 master's degrees",
        "First Black pilot to the Moon"
      ]
    },
    {
      name: "Christina Koch",
      role: "Mission Specialist",
      agency: "NASA",
      image: "/images/ChristinaKoch.jpg",
      headline: "World record holder for longest single spaceflight by a woman",
      bio: [
        "328-day spaceflight record holder. Elite engineer with M.S. in Electrical Engineering.",
        "Antarctic \"winter-over\" veteran who served as the Firefighting and Search and Rescue lead at South Pole Station in -70°C conditions.",
        "Led the first three all-female spacewalks in history. An elite ice climber and surfer who spent a full year at the South Pole, including a \"winter - over\" as a search and rescue lead. Arguably the most battle-tested isolation specialist in the astronaut corps."
      ],
      achievements: [
        "328-day spaceflight record",
        "First all-female spacewalk leader",
        "Antarctic extreme-environment specialist"
      ]
    },
    {
      name: "Jeremy Hansen",
      role: "Mission Specialist",
      agency: "CSA",
      image: "/images/JeremyHansen.jpg",
      headline: "First non-American to leave Earth orbit for the Moon",
      bio: [
        "Colonel in the Royal Canadian Air Force and CF-18 fighter pilot. Honours B.S. in Space Science, M.S. in Physics.",
        "First Canadian ever selected to lead a NASA astronaut class as instructor, proving his mastery of orbital mechanics.",
        "Lived underground for six days in Sardinian cave system. Served as aquanaut on NEEMO 19 mission. Now the first non-American to leave Earth's orbit for the Moon."
      ],
      achievements: [
        "First Canadian beyond LEO",
        "Led NASA astronaut class",
        "NEEMO 19 aquanaut"
      ]
    }
  ],
  mission: {
    title: "ARTEMIS II",
    tagline: "First crewed lunar flyby in over 50 years",
    launchDate: "April 1, 2026",
    duration: "10 days",
    highlights: [
      "Four astronauts loop around the Moon aboard NASA's most powerful rocket",
      "First humans beyond Earth orbit since Apollo 17 (1972)",
      "Fuel load: >700,000 gallons of liquid hydrogen + liquid oxygen",
      "Farthest humans from Earth since Apollo — ~250,000 miles (400,000 km)",
      "Re-entry speed ~25,000 mph (40,000 km/h) — fastest human re-entry in history",
      "Launch rocket: Space Launch System (SLS), ~8.8 million pounds of thrust",
      "Validates life support, communications, and deep-space navigation systems",
      "Lunar far-side observations and scientific data collection",
      "Historic test flight: first crewed mission of Orion spacecraft in deep space"
    ],
    significance: "Artemis II is the critical proving ground for returning humans to the lunar surface. This mission demonstrates that we can safely send astronauts to deep space and bring them home—the essential first step toward establishing a sustained presence on the Moon and preparing humanity for Mars.",
    nextSteps: [
      "Artemis III (2027): Orbital demonstration with commercial lunar lander",
      "Artemis IV (2028): First crewed lunar landing—South Pole touchdown",
      "Artemis V+ (2028+): Sustained lunar operations, Gateway station deployment, and Mars preparation"
    ]
  }
};

/**
 * Get crew member by name
 */
export function getCrewMember(name: string): CrewMember | undefined {
  return artemisData.crew.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
}
