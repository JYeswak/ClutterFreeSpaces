export interface Topic {
  slug: string;
  name: string;
  category: string;
  description: string;
  priceRange: string;
  duration: string;
  benefits: string[];
  icon: string;
}

export const topics: Topic[] = [
  // Home Spaces
  {
    slug: "garage-organization",
    name: "Garage Organization",
    category: "Home Spaces",
    description:
      "Transform your cluttered garage into a functional, organized space",
    priceRange: "$600 - $1,200",
    duration: "1-2 days",
    benefits: [
      "Seasonal equipment storage",
      "Tool and workshop organization",
      "Vehicle space optimization",
      "Sports gear systems",
    ],
    icon: "🚗",
  },
  {
    slug: "closet-organization",
    name: "Closet Organization",
    category: "Home Spaces",
    description: "Custom closet systems that maximize every inch of space",
    priceRange: "$200 - $600",
    duration: "2-6 hours",
    benefits: [
      "Custom shelving solutions",
      "Seasonal rotation systems",
      "Accessory organization",
      "Space-maximizing layouts",
    ],
    icon: "👔",
  },
  {
    slug: "kitchen-organization",
    name: "Kitchen Organization",
    category: "Home Spaces",
    description: "Efficient kitchen systems that make cooking a joy",
    priceRange: "$300 - $800",
    duration: "4-8 hours",
    benefits: [
      "Cabinet optimization",
      "Pantry systems",
      "Counter decluttering",
      "Meal prep zones",
    ],
    icon: "🍳",
  },
  {
    slug: "pantry-organization",
    name: "Pantry Organization",
    category: "Home Spaces",
    description:
      "Organized pantry systems that reduce food waste and save money",
    priceRange: "$150 - $400",
    duration: "2-4 hours",
    benefits: [
      "Clear container systems",
      "Category zones",
      "Expiration tracking",
      "Bulk storage solutions",
    ],
    icon: "🥫",
  },
  {
    slug: "bedroom-organization",
    name: "Bedroom Organization",
    category: "Home Spaces",
    description: "Create a peaceful, organized bedroom sanctuary",
    priceRange: "$200 - $500",
    duration: "3-6 hours",
    benefits: [
      "Under-bed storage",
      "Nightstand systems",
      "Clothing organization",
      "Peaceful environment",
    ],
    icon: "🛏️",
  },
  {
    slug: "home-office-organization",
    name: "Home Office Organization",
    category: "Home Spaces",
    description: "Productive workspace organization for remote work success",
    priceRange: "$250 - $600",
    duration: "3-6 hours",
    benefits: [
      "Paper management systems",
      "Cable management",
      "Supply organization",
      "Productivity zones",
    ],
    icon: "💻",
  },
  {
    slug: "basement-organization",
    name: "Basement Organization",
    category: "Home Spaces",
    description: "Transform your basement from chaos to organized storage",
    priceRange: "$500 - $1,500",
    duration: "1-2 days",
    benefits: [
      "Seasonal storage systems",
      "Humidity-resistant solutions",
      "Category zones",
      "Easy access layouts",
    ],
    icon: "🏠",
  },
  {
    slug: "mudroom-organization",
    name: "Mudroom Organization",
    category: "Home Spaces",
    description: "Functional entryway systems for busy Montana families",
    priceRange: "$200 - $500",
    duration: "2-4 hours",
    benefits: [
      "Coat and boot storage",
      "Seasonal gear rotation",
      "Pet supply zones",
      "Family command center",
    ],
    icon: "🚪",
  },
  {
    slug: "laundry-room-organization",
    name: "Laundry Room Organization",
    category: "Home Spaces",
    description: "Efficient laundry systems that streamline your routine",
    priceRange: "$150 - $400",
    duration: "2-4 hours",
    benefits: [
      "Sorting systems",
      "Supply organization",
      "Folding stations",
      "Lost sock solutions",
    ],
    icon: "🧺",
  },
  // Specialty Services
  {
    slug: "rv-organization",
    name: "RV Organization",
    category: "Specialty Services",
    description: "Maximize every inch of your RV with smart storage solutions",
    priceRange: "$400 - $800",
    duration: "4-8 hours",
    benefits: [
      "Space optimization",
      "Weight distribution",
      "Travel-ready systems",
      "Seasonal camping prep",
    ],
    icon: "🚐",
  },
  {
    slug: "tiny-home-organization",
    name: "Tiny Home Organization",
    category: "Specialty Services",
    description: "Smart solutions for small space living",
    priceRange: "$300 - $700",
    duration: "4-8 hours",
    benefits: [
      "Multi-functional furniture",
      "Vertical storage",
      "Hidden storage solutions",
      "Minimalist systems",
    ],
    icon: "🏡",
  },
  {
    slug: "whole-house-organization",
    name: "Whole House Organization",
    category: "Specialty Services",
    description: "Complete home transformation from top to bottom",
    priceRange: "$1,200 - $3,000",
    duration: "2-5 days",
    benefits: [
      "Every room organized",
      "Cohesive systems",
      "Family training",
      "Maintenance plans",
    ],
    icon: "🏠",
  },
  {
    slug: "single-room-organization",
    name: "Single Room Organization",
    category: "Specialty Services",
    description: "Focused organization for any room in your home",
    priceRange: "$200 - $600",
    duration: "2-6 hours",
    benefits: [
      "Targeted solutions",
      "Quick transformation",
      "Custom approach",
      "Maintenance training",
    ],
    icon: "🛋️",
  },
  {
    slug: "senior-downsizing",
    name: "Senior Downsizing",
    category: "Specialty Services",
    description: "Compassionate downsizing assistance for life transitions",
    priceRange: "$800 - $2,000",
    duration: "1-3 days",
    benefits: [
      "Memory preservation",
      "Family coordination",
      "Donation management",
      "Moving assistance",
    ],
    icon: "💙",
  },
  {
    slug: "estate-cleanouts",
    name: "Estate Cleanouts",
    category: "Specialty Services",
    description:
      "Respectful, thorough estate organization and cleanout services",
    priceRange: "$1,000 - $3,000",
    duration: "2-5 days",
    benefits: [
      "Complete property clearing",
      "Item sorting and valuation",
      "Donation coordination",
      "Family heirloom preservation",
    ],
    icon: "🏛️",
  },
  {
    slug: "moving-preparation",
    name: "Moving Preparation",
    category: "Specialty Services",
    description: "Get organized before you move for a smoother transition",
    priceRange: "$400 - $1,000",
    duration: "1-2 days",
    benefits: [
      "Pre-move decluttering",
      "Packing organization",
      "Labeling systems",
      "Unpacking plans",
    ],
    icon: "📦",
  },
  {
    slug: "unpacking-services",
    name: "Unpacking Services",
    category: "Specialty Services",
    description:
      "Settle into your new home quickly with professional unpacking",
    priceRange: "$400 - $1,200",
    duration: "1-2 days",
    benefits: [
      "Efficient unpacking",
      "Room-by-room setup",
      "Immediate functionality",
      "Organization from day one",
    ],
    icon: "🎁",
  },
  // Lifestyle Focus
  {
    slug: "seasonal-storage",
    name: "Seasonal Storage Solutions",
    category: "Lifestyle Focus",
    description: "Smart systems for Montana's dramatic seasonal changes",
    priceRange: "$300 - $800",
    duration: "4-8 hours",
    benefits: [
      "Rotation systems",
      "Weather-appropriate storage",
      "Easy access layouts",
      "Space optimization",
    ],
    icon: "🍂",
  },
  {
    slug: "outdoor-gear-organization",
    name: "Outdoor Gear Organization",
    category: "Lifestyle Focus",
    description: "Organize your hiking, camping, and adventure equipment",
    priceRange: "$300 - $700",
    duration: "4-8 hours",
    benefits: [
      "Gear categorization",
      "Quick-access systems",
      "Maintenance stations",
      "Trip-ready organization",
    ],
    icon: "🏔️",
  },
  {
    slug: "sports-equipment-storage",
    name: "Sports Equipment Storage",
    category: "Lifestyle Focus",
    description: "Keep your sports gear organized and ready to play",
    priceRange: "$200 - $500",
    duration: "3-6 hours",
    benefits: [
      "Sport-specific zones",
      "Easy access layouts",
      "Equipment care",
      "Family-friendly systems",
    ],
    icon: "⚾",
  },
  {
    slug: "kids-room-organization",
    name: "Kids Room Organization",
    category: "Lifestyle Focus",
    description: "Fun, functional organization that kids can maintain",
    priceRange: "$200 - $500",
    duration: "3-6 hours",
    benefits: [
      "Kid-friendly systems",
      "Toy rotation",
      "Homework zones",
      "Growth-adaptable solutions",
    ],
    icon: "🧸",
  },
  {
    slug: "craft-room-organization",
    name: "Craft Room Organization",
    category: "Lifestyle Focus",
    description: "Creative spaces that inspire and organize your supplies",
    priceRange: "$250 - $600",
    duration: "4-8 hours",
    benefits: [
      "Supply categorization",
      "Project zones",
      "Inspiration displays",
      "Work surface optimization",
    ],
    icon: "🎨",
  },
  {
    slug: "workshop-organization",
    name: "Workshop Organization",
    category: "Lifestyle Focus",
    description: "Tool and workshop organization for DIY enthusiasts",
    priceRange: "$400 - $900",
    duration: "1-2 days",
    benefits: [
      "Tool categorization",
      "Workbench optimization",
      "Safety improvements",
      "Project storage",
    ],
    icon: "🔧",
  },
  // Situational
  {
    slug: "adhd-friendly-organizing",
    name: "ADHD-Friendly Organizing",
    category: "Situational",
    description: "Organization systems designed for ADHD minds",
    priceRange: "$300 - $800",
    duration: "4-8 hours",
    benefits: [
      "Visual systems",
      "Low-maintenance solutions",
      "Habit-building support",
      "Reduced decision fatigue",
    ],
    icon: "🧠",
  },
  {
    slug: "decluttering-services",
    name: "Decluttering Services",
    category: "Situational",
    description: "Professional help to let go and create space",
    priceRange: "$200 - $600",
    duration: "3-8 hours",
    benefits: [
      "Decision support",
      "Donation coordination",
      "Emotional guidance",
      "Fresh start",
    ],
    icon: "✨",
  },
  {
    slug: "minimalist-organization",
    name: "Minimalist Organization",
    category: "Situational",
    description: "Embrace simplicity with intentional, minimal living",
    priceRange: "$300 - $700",
    duration: "4-8 hours",
    benefits: [
      "Intentional living",
      "Quality over quantity",
      "Sustainable systems",
      "Mental clarity",
    ],
    icon: "🪷",
  },
  {
    slug: "virtual-organizing",
    name: "Virtual Organizing",
    category: "Situational",
    description: "Remote organization coaching via video call",
    priceRange: "$75 - $150/hour",
    duration: "1-3 hours",
    benefits: [
      "Convenient scheduling",
      "DIY with guidance",
      "Budget-friendly",
      "Ongoing support",
    ],
    icon: "📱",
  },
  {
    slug: "maintenance-packages",
    name: "Maintenance Packages",
    category: "Situational",
    description: "Ongoing support to keep your organization systems working",
    priceRange: "$150 - $300/visit",
    duration: "2-4 hours",
    benefits: [
      "Regular tune-ups",
      "Seasonal adjustments",
      "Accountability",
      "Long-term success",
    ],
    icon: "🔄",
  },
];

export function getTopic(slug: string): Topic | undefined {
  return topics.find((topic) => topic.slug === slug);
}

export function getAllTopicSlugs(): string[] {
  return topics.map((topic) => topic.slug);
}

export function getTopicsByCategory(): Record<string, Topic[]> {
  return topics.reduce(
    (acc, topic) => {
      if (!acc[topic.category]) {
        acc[topic.category] = [];
      }
      acc[topic.category].push(topic);
      return acc;
    },
    {} as Record<string, Topic[]>,
  );
}
