import { Metadata } from "next";
import { notFound } from "next/navigation";
import { locations, getLocation } from "@/data/locations";
import { topics, getTopic } from "@/data/topics";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    location: string;
    topic: string;
  }>;
}

export async function generateStaticParams() {
  const params: { location: string; topic: string }[] = [];

  for (const location of locations) {
    for (const topic of topics) {
      params.push({
        location: location.slug,
        topic: topic.slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { location: locationSlug, topic: topicSlug } = await params;
  const location = getLocation(locationSlug);
  const topic = getTopic(topicSlug);

  if (!location || !topic) {
    return { title: "Page Not Found" };
  }

  const title = `${topic.name} in ${location.name}, ${location.stateAbbr} | Clutter Free Spaces`;
  const description = `Stress-free ${topic.name.toLowerCase()} services in ${location.name}, ${location.state}. ${topic.description}. ${topic.priceRange}. Book your free consultation today.`;

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

export default async function LocationTopicPage({ params }: PageProps) {
  const { location: locationSlug, topic: topicSlug } = await params;
  const location = getLocation(locationSlug);
  const topic = getTopic(topicSlug);

  if (!location || !topic) {
    notFound();
  }

  const phone = "(406) 285-1525";
  const phoneHref = "tel:+14062851525";

  return (
    <main className="min-h-screen bg-white">
      {/* Header - Clean white with teal accents */}
      <header className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link
            href="https://www.clutter-free-spaces.com"
            className="text-xl font-bold text-gray-900 hover:text-teal-600 transition"
          >
            Clutter Free Spaces
          </Link>
          <div className="flex items-center gap-4">
            <a
              href={phoneHref}
              className="hidden sm:block text-gray-600 hover:text-teal-600 transition"
            >
              {phone}
            </a>
            <a
              href="https://calendly.com/chanelnbasolo/30min"
              className="bg-teal-500 text-white px-5 py-2 rounded-full font-medium hover:bg-teal-600 transition"
            >
              Book Free Consultation
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean and welcoming */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-6xl mb-6 block">{topic.icon}</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {topic.name} in {location.name}, {location.stateAbbr}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create a space that works for you, not against you. Our stress-free{" "}
            {topic.name.toLowerCase()} services help {location.name} residents
            reclaim their homes with zero judgment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/chanelnbasolo/30min"
              className="bg-teal-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-teal-600 transition shadow-lg shadow-teal-500/25"
            >
              Schedule Free Consultation
            </a>
            <a
              href={phoneHref}
              className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-teal-500 hover:text-teal-600 transition"
            >
              Call {phone}
            </a>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 text-center text-gray-600">
            <div>
              <span className="block text-2xl font-bold text-gray-900">100%</span>
              <span className="text-sm">Non-Judgmental</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-gray-900">Free</span>
              <span className="text-sm">30-Min Consultation</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-gray-900">Local</span>
              <span className="text-sm">{location.region}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Service Details
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Investment</span>
                  <span className="font-semibold text-teal-600">
                    {topic.priceRange}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-900">{topic.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service Area</span>
                  <span className="font-semibold text-gray-900">
                    {location.name}, {location.stateAbbr}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-teal-50 p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                What&apos;s Included
              </h2>
              <ul className="space-y-3">
                {topic.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-teal-500 mt-0.5 text-lg">✓</span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Content Section */}
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600">
            <h2>
              About {topic.name} in {location.name}
            </h2>
            <p>
              {topic.description}. At Clutter Free Spaces, we believe everyone
              deserves a home that feels calm and organized. Our {topic.name.toLowerCase()}{" "}
              services are designed specifically for {location.region} residents who
              want expert help without the stress or judgment.
            </p>

            {location.localFeatures && location.localFeatures.length > 0 && (
              <>
                <h3>Serving the {location.name} Community</h3>
                <p>
                  Whether you&apos;re near {location.localFeatures.slice(0, 2).join(" or ")},
                  we understand the unique lifestyle of {location.name} residents.
                  Our {topic.name.toLowerCase()} solutions are tailored to work with
                  your home and your life.
                </p>
              </>
            )}

            {location.neighborhoods && location.neighborhoods.length > 0 && (
              <>
                <h3>Areas We Serve in {location.name}</h3>
                <ul>
                  {location.neighborhoods.map((neighborhood, idx) => (
                    <li key={idx}>{neighborhood}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section - Teal gradient */}
      <section className="bg-gradient-to-br from-teal-500 to-teal-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Love Your Space Again?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Start with a free, no-pressure consultation. We&apos;ll listen to your
            goals and create a custom plan for your {location.name} home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/chanelnbasolo/30min"
              className="bg-white text-teal-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-teal-50 transition shadow-lg"
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
            <a href={phoneHref} className="hover:text-teal-400 transition">
              {phone}
            </a>
            {" • "}
            <a
              href="mailto:contact@clutter-free-spaces.com"
              className="hover:text-teal-400 transition"
            >
              contact@clutter-free-spaces.com
            </a>
          </p>
          <p className="text-sm">
            © 2025 Clutter Free Spaces. Professional Organization Services in{" "}
            {location.region}.
          </p>
        </div>
      </footer>
    </main>
  );
}
