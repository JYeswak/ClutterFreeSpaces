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
  },
  // North Texas Locations
  {
    slug: "denton",
    name: "Denton",
    state: "Texas",
    stateAbbr: "TX",
    region: "North Texas",
    population: 150000,
    neighborhoods: [
      "Downtown Denton",
      "University of North Texas area",
      "Texas Woman's University area",
      "Robson Ranch",
      "Corinth area",
      "Hickory Creek"
    ],
    localFeatures: [
      "University of North Texas",
      "Texas Woman's University",
      "Denton Square",
      "Ray Roberts Lake"
    ]
  },
  {
    slug: "flower-mound",
    name: "Flower Mound",
    state: "Texas",
    stateAbbr: "TX",
    region: "North Texas",
    population: 80000,
    neighborhoods: [
      "The River Walk",
      "Wellington",
      "Bridlewood",
      "Canyon Falls",
      "Lakeside DFW"
    ],
    localFeatures: [
      "Grapevine Lake",
      "The River Walk at Central Park",
      "Twin Coves Park"
    ]
  },
  {
    slug: "lewisville",
    name: "Lewisville",
    state: "Texas",
    stateAbbr: "TX",
    region: "North Texas",
    population: 115000,
    neighborhoods: [
      "Old Town Lewisville",
      "Castle Hills",
      "Vista Ridge area",
      "Valley Ridge",
      "Lakewood Village"
    ],
    localFeatures: [
      "Lake Lewisville",
      "Vista Ridge Mall",
      "Music City Mall"
    ]
  },
  {
    slug: "highland-village",
    name: "Highland Village",
    state: "Texas",
    stateAbbr: "TX",
    region: "North Texas",
    population: 16000,
    neighborhoods: [
      "The Highlands",
      "Lakewood",
      "Highland Shores",
      "Sellmeyer Hills"
    ],
    localFeatures: [
      "The Shops at Highland Village",
      "Copperas Branch Park",
      "Lake Lewisville shoreline"
    ]
  },
  {
    slug: "frisco",
    name: "Frisco",
    state: "Texas",
    stateAbbr: "TX",
    region: "North Texas",
    population: 220000,
    neighborhoods: [
      "Stonebriar",
      "Legacy West",
      "The Star District",
      "Newman Village",
      "Phillips Creek Ranch",
      "Starwood"
    ],
    localFeatures: [
      "The Star (Dallas Cowboys HQ)",
      "Stonebriar Centre",
      "PGA of America Headquarters",
      "Dr Pepper Ballpark"
    ]
  },
  {
    slug: "mckinney",
    name: "McKinney",
    state: "Texas",
    stateAbbr: "TX",
    region: "North Texas",
    population: 200000,
    neighborhoods: [
      "Historic Downtown McKinney",
      "Craig Ranch",
      "Stonebridge Ranch",
      "Adriatica Village",
      "Trinity Falls",
      "Eldorado"
    ],
    localFeatures: [
      "Historic Downtown Square",
      "Adriatica Village",
      "Heard Natural Science Museum"
    ]
  },
  {
    slug: "prosper",
    name: "Prosper",
    state: "Texas",
    stateAbbr: "TX",
    region: "North Texas",
    population: 35000,
    neighborhoods: [
      "Windsong Ranch",
      "Star Trail",
      "Whitley Place",
      "Gentle Creek",
      "Lakes of Prosper"
    ],
    localFeatures: [
      "Prosper Town Center",
      "Top-rated Prosper ISD schools",
      "Frontier Park"
    ]
  },
  {
    slug: "celina",
    name: "Celina",
    state: "Texas",
    stateAbbr: "TX",
    region: "North Texas",
    population: 25000,
    neighborhoods: [
      "Historic Downtown Celina",
      "Light Farms",
      "Mustang Lakes",
      "Carter Ranch"
    ],
    localFeatures: [
      "Historic Celina Square",
      "Light Farms amenity center",
      "Celina ISD schools"
    ]
  },
  {
    slug: "plano",
    name: "Plano",
    state: "Texas",
    stateAbbr: "TX",
    region: "North Texas",
    population: 290000,
    neighborhoods: [
      "Legacy West",
      "Downtown Plano",
      "Willow Bend",
      "Preston Hollow",
      "Kings Ridge",
      "Deerfield"
    ],
    localFeatures: [
      "Legacy West",
      "The Shops at Willow Bend",
      "Arbor Hills Nature Preserve",
      "Toyota Music Factory nearby"
    ]
  },
  {
    slug: "dallas",
    name: "Dallas",
    state: "Texas",
    stateAbbr: "TX",
    region: "North Texas",
    population: 1300000,
    neighborhoods: [
      "North Dallas",
      "Preston Hollow",
      "Lake Highlands",
      "Far North Dallas",
      "Addison area",
      "Richardson border"
    ],
    localFeatures: [
      "Dallas Arts District",
      "NorthPark Center",
      "White Rock Lake",
      "Galleria Dallas"
    ]
  },
  {
    slug: "fort-worth",
    name: "Fort Worth",
    state: "Texas",
    stateAbbr: "TX",
    region: "North Texas",
    population: 970000,
    neighborhoods: [
      "Southlake border",
      "Alliance area",
      "Clearfork",
      "TCU area",
      "North Richland Hills",
      "Keller area"
    ],
    localFeatures: [
      "Fort Worth Stockyards",
      "Sundance Square",
      "TCU campus",
      "Fort Worth Zoo"
    ]
  },
  {
    slug: "southlake",
    name: "Southlake",
    state: "Texas",
    stateAbbr: "TX",
    region: "North Texas",
    population: 32000,
    neighborhoods: [
      "Southlake Town Square area",
      "Timarron",
      "Clariden Ranch",
      "Carillon",
      "Estes Park"
    ],
    localFeatures: [
      "Southlake Town Square",
      "Carroll ISD (top-rated schools)",
      "Bob Jones Nature Center"
    ]
  }
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((loc) => loc.slug === slug);
}

export function getAllLocationSlugs(): string[] {
  return locations.map((loc) => loc.slug);
}
