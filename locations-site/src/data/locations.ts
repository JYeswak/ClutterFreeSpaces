export interface Location {
  slug: string;
  name: string;
  state: string;
  stateAbbr: string;
  region: string;
  population?: number;
  neighborhoods?: string[];
  localFeatures?: string[];
}

export const locations: Location[] = [
  {
    slug: "missoula",
    name: "Missoula",
    state: "Montana",
    stateAbbr: "MT",
    region: "Western Montana",
    population: 75000,
    neighborhoods: [
      "Downtown Missoula",
      "University of Montana area",
      "South Hills",
      "Rattlesnake Valley",
      "Miller Creek",
      "Grant Creek"
    ],
    localFeatures: [
      "University of Montana",
      "Clark Fork River",
      "Rattlesnake Wilderness"
    ]
  },
  {
    slug: "hamilton",
    name: "Hamilton",
    state: "Montana",
    stateAbbr: "MT",
    region: "Bitterroot Valley",
    population: 5000,
    neighborhoods: [
      "Downtown Hamilton",
      "Marcus Daly Historic District",
      "Sleeping Child Road area"
    ],
    localFeatures: [
      "Bitterroot River",
      "Daly Mansion",
      "Bitterroot National Forest"
    ]
  },
  {
    slug: "stevensville",
    name: "Stevensville",
    state: "Montana",
    stateAbbr: "MT",
    region: "Bitterroot Valley",
    population: 2000,
    neighborhoods: ["Historic Downtown", "Fort Owen area"],
    localFeatures: [
      "Fort Owen State Park",
      "St. Mary's Mission",
      "Lee Metcalf Wildlife Refuge"
    ]
  },
  {
    slug: "florence",
    name: "Florence",
    state: "Montana",
    stateAbbr: "MT",
    region: "Bitterroot Valley",
    population: 800,
    neighborhoods: ["Florence proper", "Carlton area"],
    localFeatures: ["Bitterroot River access", "Florence-Carlton Schools"]
  },
  {
    slug: "lolo",
    name: "Lolo",
    state: "Montana",
    stateAbbr: "MT",
    region: "Western Montana",
    population: 4000,
    neighborhoods: ["Lolo proper", "Highway 93 corridor"],
    localFeatures: [
      "Lolo Hot Springs",
      "Travelers Rest State Park",
      "Lolo Pass"
    ]
  },
  {
    slug: "frenchtown",
    name: "Frenchtown",
    state: "Montana",
    stateAbbr: "MT",
    region: "Western Montana",
    population: 1800,
    neighborhoods: ["Frenchtown proper", "Huson area"],
    localFeatures: ["Clark Fork River", "Frenchtown Pond State Park"]
  },
  {
    slug: "western-montana",
    name: "Western Montana",
    state: "Montana",
    stateAbbr: "MT",
    region: "Western Montana",
    population: 150000,
    neighborhoods: [],
    localFeatures: [
      "Glacier National Park access",
      "Multiple ski resorts",
      "Extensive wilderness areas"
    ]
  }
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((loc) => loc.slug === slug);
}

export function getAllLocationSlugs(): string[] {
  return locations.map((loc) => loc.slug);
}
