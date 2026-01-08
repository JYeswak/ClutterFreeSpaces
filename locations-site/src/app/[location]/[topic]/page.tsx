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
      {/* Header - Clean white with rose accents */}
      <header className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link
            href="https://www.clutter-free-spaces.com"
            className="text-xl font-bold text-gray-900 hover:text-rose-600 transition"
          >
            Clutter Free Spaces
          </Link>
          <div className="flex items-center gap-4">
            <a
              href={phoneHref}
              className="hidden sm:block text-gray-600 hover:text-rose-600 transition"
            >
              {phone}
            </a>
            <a
              href="https://calendly.com/chanelnbasolo/30min"
              className="bg-rose-500 text-white px-5 py-2 rounded-full font-medium hover:bg-rose-600 transition"
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
              className="bg-rose-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-rose-600 transition shadow-lg shadow-rose-500/25"
            >
              Schedule Free Consultation
            </a>
            <a
              href={phoneHref}
              className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:border-rose-500 hover:text-rose-600 transition"
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
                  <span className="font-semibold text-rose-600">
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

            <div className="bg-rose-50 p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                What&apos;s Included
              </h2>
              <ul className="space-y-3">
                {topic.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-rose-500 mt-0.5 text-lg">✓</span>
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Why Choose Us - Visual Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Zero Judgment</h3>
              <p className="text-gray-600 text-sm">
                We&apos;ve seen it all. No matter the state of your space, we&apos;re here to help, not judge.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Stress-Free Process</h3>
              <p className="text-gray-600 text-sm">
                We handle the heavy lifting. You just point us in the right direction.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lasting Results</h3>
              <p className="text-gray-600 text-sm">
                We create systems you can actually maintain. No more weekend clean-up marathons.
              </p>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              What Our Clients Say
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  &quot;Chanel and Clutter Free Space transformed my space! From the initial consult, to the efficient organizing of my space... I am blown away by the transformation.&quot;
                </p>
                <p className="font-semibold text-gray-900">— Mandy S.</p>
                <p className="text-sm text-gray-500">Google Review</p>
              </div>

              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  &quot;I cannot recommend Chanel enough! She came to organize my closet, and I am blown away by the transformation.&quot;
                </p>
                <p className="font-semibold text-gray-900">— Madison S.</p>
                <p className="text-sm text-gray-500">Google Review</p>
              </div>

              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  &quot;Professional, organized, helpful and kind! Working with Clutter Free Spaces helped me immensely while unpacking into a new home after a major move!&quot;
                </p>
                <p className="font-semibold text-gray-900">— Ashley V.</p>
                <p className="text-sm text-gray-500">Google Review</p>
              </div>

              <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  &quot;I worked with Chanel to get my 5th Wheel ready for full-time living. She provided a full RV Organization... We&apos;re so happy with the end result!&quot;
                </p>
                <p className="font-semibold text-gray-900">— Joshua N.</p>
                <p className="text-sm text-gray-500">Google Review</p>
              </div>
            </div>

            <div className="text-center mt-8">
              <a
                href="https://www.google.com/maps/place/Clutter+Free+Spaces"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium"
              >
                <span>See all reviews on Google</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* About Section - Cleaner */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {topic.name} in {location.name}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {topic.description}. Our {topic.name.toLowerCase()} services are designed
              specifically for {location.region} residents who want expert help transforming
              their space into something that actually works for their lifestyle.
            </p>
            {location.localFeatures && location.localFeatures.length > 0 && (
              <p className="text-gray-600 leading-relaxed mt-4">
                Whether you&apos;re near {location.localFeatures.slice(0, 2).join(" or ")},
                we understand the unique way {location.name} residents live—and we&apos;ll
                create solutions that fit.
              </p>
            )}
          </div>

          {/* Neighborhoods Section - Visual Grid */}
          {location.neighborhoods && location.neighborhoods.length > 0 && (
            <div className="mt-12 p-8 bg-gray-50 rounded-3xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Areas We Serve in {location.name}
              </h2>
              <div className="flex flex-wrap gap-3">
                {location.neighborhoods.map((neighborhood, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 text-sm font-medium hover:border-rose-300 hover:bg-rose-50 transition"
                  >
                    <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {neighborhood}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Teal gradient */}
      <section className="bg-gradient-to-br from-rose-500 to-rose-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Love Your Space Again?
          </h2>
          <p className="text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
            Start with a free, no-pressure consultation. We&apos;ll listen to your
            goals and create a custom plan for your {location.name} home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/chanelnbasolo/30min"
              className="bg-white text-rose-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-rose-50 transition shadow-lg"
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
            <a href={phoneHref} className="hover:text-rose-400 transition">
              {phone}
            </a>
            {" • "}
            <a
              href="mailto:contact@clutter-free-spaces.com"
              className="hover:text-rose-400 transition"
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
