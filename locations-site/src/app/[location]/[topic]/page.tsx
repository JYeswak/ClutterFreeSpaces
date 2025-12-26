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
  const phone =
    location.state === "Texas" ? "(970) 717-0462" : "(406) 285-1525";
  const description = `Professional ${topic.name.toLowerCase()} services in ${location.name}, ${location.state}. ${topic.description}. ${topic.priceRange}. Call ${phone} for a free consultation.`;

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

  const phone =
    location.state === "Texas" ? "(970) 717-0462" : "(406) 285-1525";
  const phoneHref =
    location.state === "Texas" ? "tel:+19707170462" : "tel:+14062851525";

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-emerald-700 text-white py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link
            href="https://www.clutter-free-spaces.com"
            className="text-xl font-bold"
          >
            Clutter Free Spaces
          </Link>
          <a
            href={phoneHref}
            className="bg-white text-emerald-700 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-50 transition"
          >
            {phone}
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-5xl mb-4 block">{topic.icon}</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {topic.name} in {location.name}, {location.stateAbbr}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional {topic.name.toLowerCase()} services for {location.name}{" "}
            residents
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/chanelnbasolo/30min"
              className="bg-emerald-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-700 transition"
            >
              Schedule Free Consultation
            </a>
            <a
              href={phoneHref}
              className="border-2 border-emerald-600 text-emerald-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-50 transition"
            >
              Call {phone}
            </a>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Service Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Investment:</span>
                  <span className="font-semibold text-emerald-700">
                    {topic.priceRange}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{topic.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Area:</span>
                  <span className="font-semibold">
                    {location.name}, {location.stateAbbr}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                What&apos;s Included
              </h2>
              <ul className="space-y-2">
                {topic.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2>
              About {topic.name} in {location.name}
            </h2>
            <p>
              {topic.description}. As {location.name}&apos;s trusted
              professional organizer, Clutter Free Spaces brings expert{" "}
              {topic.name.toLowerCase()} solutions tailored to the unique needs
              of {location.region} residents.
            </p>

            {location.localFeatures && location.localFeatures.length > 0 && (
              <>
                <h3>Serving the {location.name} Community</h3>
                <p>
                  We understand the lifestyle of {location.name} residents, from{" "}
                  {location.localFeatures.slice(0, 2).join(" to ")} and beyond.
                  Our {topic.name.toLowerCase()} solutions are designed to work
                  with your {location.region} lifestyle.
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

      {/* CTA Section */}
      <section className="bg-emerald-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Space?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Get started with a free consultation. We&apos;ll discuss your goals
            and create a custom plan for your {location.name} home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/chanelnbasolo/30min"
              className="bg-white text-emerald-700 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-50 transition"
            >
              Book Your Free Consultation
            </a>
            <a
              href="https://www.clutter-free-spaces.com"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-600 transition"
            >
              Visit Main Site
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="mb-2">
            <a href={phoneHref} className="hover:text-white">
              {phone}
            </a>
            {" • "}
            <a
              href="mailto:contact@clutter-free-spaces.com"
              className="hover:text-white"
            >
              contact@clutter-free-spaces.com
            </a>
          </p>
          <p>
            © 2025 Clutter Free Spaces. Professional Organization Services in{" "}
            {location.region}.
          </p>
        </div>
      </footer>
    </main>
  );
}
