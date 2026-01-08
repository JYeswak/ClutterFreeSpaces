import { MetadataRoute } from "next";
import { locations } from "@/data/locations";
import { topics } from "@/data/topics";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://clutter-free-spaces.com/locations";

  // Index page
  const indexPage = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 1.0,
  };

  // Location landing pages (e.g., /missoula, /celina)
  const locationLandingPages = locations.map((location) => ({
    url: `${baseUrl}/${location.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Generate all location × topic combinations
  const servicePages = locations.flatMap((location) =>
    topics.map((topic) => ({
      url: `${baseUrl}/${location.slug}/${topic.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  );

  return [indexPage, ...locationLandingPages, ...servicePages];
}
