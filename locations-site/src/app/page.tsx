import Link from "next/link";
import { locations } from "@/data/locations";
import { topics, getTopicsByCategory } from "@/data/topics";

export const metadata = {
  title: "Location Pages | Clutter Free Spaces",
  description: "Professional home organization services across Montana",
};

export default function Home() {
  const topicsByCategory = getTopicsByCategory();
  const totalPages = locations.length * topics.length;

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Clutter Free Spaces - Location Pages
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {totalPages} landing pages across {locations.length} locations and{" "}
          {topics.length} services
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Locations */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Locations ({locations.length})
            </h2>
            <ul className="space-y-2">
              {locations.map((location) => (
                <li key={location.slug}>
                  <span className="font-medium">{location.name}</span>
                  <span className="text-gray-500 ml-2">
                    ({location.region})
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Topics by Category */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Services ({topics.length})
            </h2>
            {Object.entries(topicsByCategory).map(([category, categoryTopics]) => (
              <div key={category} className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">{category}</h3>
                <ul className="space-y-1 pl-4">
                  {categoryTopics.map((topic) => (
                    <li key={topic.slug} className="text-gray-600">
                      {topic.icon} {topic.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Pages */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sample Landing Pages
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {locations.slice(0, 3).map((location) =>
              topics.slice(0, 4).map((topic) => (
                <Link
                  key={`${location.slug}-${topic.slug}`}
                  href={`/${location.slug}/${topic.slug}`}
                  className="block p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition"
                >
                  <span className="text-2xl">{topic.icon}</span>
                  <p className="font-medium text-gray-900 mt-2">
                    {topic.name}
                  </p>
                  <p className="text-sm text-gray-500">in {location.name}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Back to main site */}
        <div className="mt-8 text-center">
          <a
            href="https://www.clutter-free-spaces.com"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Back to Main Site
          </a>
        </div>
      </div>
    </main>
  );
}
