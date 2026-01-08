import Link from "next/link";
import { locations } from "@/data/locations";
import { topics, getTopicsByCategory } from "@/data/topics";

export const metadata = {
  title: "Service Areas | Clutter Free Spaces",
  description:
    "Professional home organization services in Montana and North Texas. Find organizing help near you in Missoula, Hamilton, Denton, Frisco, and more.",
};

export default function Home() {
  const topicsByCategory = getTopicsByCategory();
  const montanaLocations = locations.filter(
    (loc) => loc.state === "Montana"
  );
  const texasLocations = locations.filter((loc) => loc.state === "Texas");

  const phone = "(406) 285-1525";
  const phoneHref = "tel:+14062851525";

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link
            href="https://www.clutter-free-spaces.com"
            className="text-xl font-bold text-gray-900 hover:text-rose-400 transition"
          >
            Clutter Free Spaces
          </Link>
          <div className="flex items-center gap-4">
            <a
              href={phoneHref}
              className="hidden sm:block text-gray-600 hover:text-rose-400 transition"
            >
              {phone}
            </a>
            <a
              href="https://calendly.com/chanelnbasolo/30min"
              className="bg-rose-400 text-white px-5 py-2 rounded-full font-medium hover:bg-rose-500 transition"
            >
              Book Free Consultation
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24" style={{ background: 'linear-gradient(to bottom right, #FDE8E8, white)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Professional Organizing Near You
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find stress-free, judgment-free organization services in your area.
            We help homes across Montana and North Texas reclaim their space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/chanelnbasolo/30min"
              className="bg-rose-400 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-rose-500 transition shadow-lg"
              style={{ boxShadow: '0 10px 25px -5px rgba(244, 114, 182, 0.3)' }}
            >
              Schedule Free Consultation
            </a>
            <a
              href={phoneHref}
              className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-rose-300 hover:text-rose-500 transition"
            >
              Call {phone}
            </a>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Where We Serve
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Montana */}
            <div className="rounded-3xl p-8" style={{ backgroundColor: '#FDE8E8' }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">🏔️</span>
                <h3 className="text-2xl font-bold text-gray-900">Montana</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Serving Western Montana with hands-on, personalized organization
                services.
              </p>
              <div className="flex flex-wrap gap-3">
                {montanaLocations.map((location) => (
                  <Link
                    key={location.slug}
                    href={`/locations/${location.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-200 rounded-full text-gray-700 text-sm font-medium hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 transition"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-rose-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {location.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Texas */}
            <div className="rounded-3xl p-8" style={{ backgroundColor: '#FDE8E8' }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">⛪</span>
                <h3 className="text-2xl font-bold text-gray-900">North Texas</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Expanding to serve the Dallas-Fort Worth metroplex with virtual
                consultations available now.
              </p>
              <div className="flex flex-wrap gap-3">
                {texasLocations.map((location) => (
                  <Link
                    key={location.slug}
                    href={`/locations/${location.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-200 rounded-full text-gray-700 text-sm font-medium hover:border-rose-400 hover:bg-rose-50 hover:text-rose-600 transition"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-rose-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {location.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Our Services
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            From single rooms to whole-house transformations, we offer
            stress-free solutions for every organizing challenge.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(topicsByCategory).map(([category, categoryTopics]) => (
              <div key={category} className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  {category}
                </h3>
                <ul className="space-y-2">
                  {categoryTopics.map((topic) => (
                    <li key={topic.slug}>
                      <Link
                        href={`/locations/missoula/${topic.slug}`}
                        className="flex items-center gap-2 text-gray-600 hover:text-rose-500 transition text-sm"
                      >
                        <span>{topic.icon}</span>
                        <span>{topic.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Popular Services
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topics.slice(0, 8).map((topic) => (
              <Link
                key={topic.slug}
                href={`/locations/missoula/${topic.slug}`}
                className="group block p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-rose-200 transition"
              >
                <span className="text-4xl block mb-4">{topic.icon}</span>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-rose-500 transition">
                  {topic.name}
                </h3>
                <p className="text-sm text-rose-400 font-medium">
                  {topic.priceRange}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-white py-16" style={{ background: 'linear-gradient(to bottom right, #E8B4B8, #D4A5A5)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Love Your Space Again?
          </h2>
          <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
            Start with a free, no-pressure consultation. We&apos;ll listen to
            your goals and create a custom plan for your home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/chanelnbasolo/30min"
              className="bg-white text-rose-500 px-8 py-4 rounded-full font-semibold text-lg hover:bg-rose-50 transition shadow-lg"
            >
              Book Your Free Consultation
            </a>
            <a
              href="https://www.clutter-free-spaces.com"
              className="border-2 border-white/50 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition"
            >
              Learn More About Us
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white font-medium mb-4">Clutter Free Spaces</p>
          <p className="mb-4">
            <a href={phoneHref} className="hover:text-rose-300 transition">
              {phone}
            </a>
            {" • "}
            <a
              href="mailto:contact@clutter-free-spaces.com"
              className="hover:text-rose-300 transition"
            >
              contact@clutter-free-spaces.com
            </a>
          </p>
          <p className="text-sm">
            © 2025 Clutter Free Spaces. Professional Organization Services in
            Montana & North Texas.
          </p>
        </div>
      </footer>
    </main>
  );
}
