import { Metadata } from "next";
import { notFound } from "next/navigation";
import { locations, getLocation } from "@/data/locations";
import { topics, getTopicsByCategory } from "@/data/topics";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    location: string;
  }>;
}

export async function generateStaticParams() {
  return locations.map((location) => ({
    location: location.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { location: locationSlug } = await params;
  const location = getLocation(locationSlug);

  if (!location) {
    return { title: "Page Not Found" };
  }

  const title = `Professional Organizing in ${location.name}, ${location.stateAbbr} | Clutter Free Spaces`;
  const description = `Stress-free, judgment-free home organization services in ${location.name}, ${location.state}. Garage, closet, kitchen, RV organization & more. Book your free consultation today.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { location: locationSlug } = await params;
  const location = getLocation(locationSlug);

  if (!location) {
    notFound();
  }

  const topicsByCategory = getTopicsByCategory();
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
      <section
        className="py-16 md:py-24"
        style={{ background: "linear-gradient(to bottom right, #FDE8E8, white)" }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-rose-500 font-medium mb-4">
            Serving {location.region}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Professional Organizing in {location.name}, {location.stateAbbr}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stress-free, judgment-free organization services tailored to your
            home and lifestyle. We help {location.name} families reclaim their
            space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/chanelnbasolo/30min"
              className="bg-rose-400 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-rose-500 transition shadow-lg"
              style={{ boxShadow: "0 10px 25px -5px rgba(244, 114, 182, 0.3)" }}
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

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Our Services in {location.name}
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            From single rooms to whole-house transformations, we offer
            stress-free solutions for every organizing challenge.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(topicsByCategory).map(([category, categoryTopics]) => (
              <div
                key={category}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                  {category}
                </h3>
                <ul className="space-y-2">
                  {categoryTopics.map((topic) => (
                    <li key={topic.slug}>
                      <Link
                        href={`/locations/${location.slug}/${topic.slug}`}
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

      {/* Popular Services */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Popular Services
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topics.slice(0, 8).map((topic) => (
              <Link
                key={topic.slug}
                href={`/locations/${location.slug}/${topic.slug}`}
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

      {/* Local Info */}
      {((location.neighborhoods && location.neighborhoods.length > 0) || (location.localFeatures && location.localFeatures.length > 0)) && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Serving All of {location.name}
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {location.neighborhoods && location.neighborhoods.length > 0 && (
                <div
                  className="rounded-2xl p-6"
                  style={{ backgroundColor: "#FDE8E8" }}
                >
                  <h3 className="font-bold text-gray-900 mb-4">
                    Neighborhoods We Serve
                  </h3>
                  <ul className="space-y-2">
                    {location.neighborhoods.map((neighborhood) => (
                      <li
                        key={neighborhood}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <svg
                          className="w-4 h-4 text-rose-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {neighborhood}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {location.localFeatures && location.localFeatures.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Local Landmarks</h3>
                  <ul className="space-y-2">
                    {location.localFeatures.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <svg
                          className="w-4 h-4 text-rose-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            What Our Clients Say
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">
                &quot;Chanel and Clutter Free Space transformed my space! From
                the initial consult, to the efficient organizing... I am blown
                away by the transformation.&quot;
              </p>
              <p className="font-semibold text-gray-900">— Mandy S.</p>
            </div>

            <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">
                &quot;Professional, organized, helpful and kind! Working with
                Clutter Free Spaces helped me immensely while unpacking into a
                new home after a major move!&quot;
              </p>
              <p className="font-semibold text-gray-900">— Ashley V.</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <a
              href="https://www.google.com/search?q=Clutter+Free+Spaces+Missoula+reviews"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium"
            >
              <span>See all reviews on Google</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="text-white py-16"
        style={{ background: "linear-gradient(to bottom right, #E8B4B8, #D4A5A5)" }}
      >
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Love Your Space Again?
          </h2>
          <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
            Start with a free, no-pressure consultation. We&apos;ll listen to
            your goals and create a custom plan for your {location.name} home.
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
