class SEOService {
  constructor() {
    this.businessName = "ClutterFree Spaces";
    this.businessDescription =
      "Professional home organization services transforming Montana homes into organized, functional spaces";
    this.serviceArea = "Missoula, Montana and surrounding areas";
    this.phone = "(406) 285-1525";
    this.email = "contact@clutter-free-spaces.com";
    this.website = "https://www.clutter-free-spaces.com";
    this.address = {
      streetAddress: "", // To be filled when available
      addressLocality: "Missoula",
      addressRegion: "MT",
      postalCode: "59801",
      addressCountry: "US",
    };
    this.geoCoordinates = {
      latitude: "46.8721",
      longitude: "-113.9940", // Missoula coordinates
    };

    // Core services offered
    this.services = {
      "whole-house": {
        name: "Whole House Organization",
        description:
          "Complete home transformation with systematic organization of every room and space",
        duration: "2-5 days",
        priceRange: "$1200-3000",
        keywords: [
          "whole house organization",
          "complete home organizing",
          "full home decluttering",
        ],
      },
      "rv-organization": {
        name: "RV Organization",
        description:
          "Specialized RV storage solutions and organization systems for travel enthusiasts",
        duration: "4-8 hours",
        priceRange: "$400-800",
        keywords: [
          "RV organization Montana",
          "motorhome organizing",
          "travel trailer storage solutions",
        ],
      },
      "garage-organization": {
        name: "Garage Organization",
        description:
          "Transform cluttered garages into functional storage and workspace areas",
        duration: "1-2 days",
        priceRange: "$600-1200",
        keywords: [
          "garage organization Missoula",
          "garage storage systems",
          "garage decluttering",
        ],
      },
      "single-room": {
        name: "Single Room Organization",
        description:
          "Focused organization solutions for individual rooms like bedrooms, offices, or kitchens",
        duration: "2-6 hours",
        priceRange: "$200-600",
        keywords: [
          "bedroom organization",
          "home office organizing",
          "kitchen organization",
        ],
      },
      "senior-downsizing": {
        name: "Senior Downsizing & Estate Organization",
        description:
          "Compassionate downsizing assistance and estate organization for seniors and families",
        duration: "1-3 days",
        priceRange: "$800-2000",
        keywords: [
          "senior downsizing Montana",
          "estate organization",
          "moving assistance seniors",
        ],
      },
    };

    // Target locations for local SEO
    this.serviceLocations = [
      "Missoula, Montana",
      "Hamilton, Montana",
      "Stevensville, Montana",
      "Florence, Montana",
      "Lolo, Montana",
      "Western Montana",
    ];
  }

  /**
   * Generate LocalBusiness schema markup for homepage
   */
  generateLocalBusinessSchema() {
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${this.website}#localbusiness`,
      name: this.businessName,
      description: this.businessDescription,
      url: this.website,
      telephone: this.phone,
      email: this.email,
      image: `${this.website}/images/clutterfreespaces-logo.jpg`,
      logo: `${this.website}/images/clutterfreespaces-logo.jpg`,
      address: {
        "@type": "PostalAddress",
        addressLocality: this.address.addressLocality,
        addressRegion: this.address.addressRegion,
        postalCode: this.address.postalCode,
        addressCountry: this.address.addressCountry,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: this.geoCoordinates.latitude,
        longitude: this.geoCoordinates.longitude,
      },
      areaServed: this.serviceLocations.map((location) => ({
        "@type": "City",
        name: location,
      })),
      serviceType: Object.values(this.services).map((service) => service.name),
      priceRange: "$200-$3000",
      currenciesAccepted: "USD",
      paymentAccepted: "Cash, Check, Credit Card, Venmo",
      openingHours: "Mo-Fr 08:00-17:00",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Home Organization Services",
        itemListElement: Object.entries(this.services).map(
          ([key, service], index) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.name,
              description: service.description,
              provider: {
                "@type": "LocalBusiness",
                "@id": `${this.website}#localbusiness`,
              },
            },
          }),
        ),
      },
      sameAs: [
        "https://www.facebook.com/clutterfreespaces",
        "https://www.instagram.com/clutterfreespaces",
        "https://g.page/clutterfreespaces",
      ],
    };

    return {
      success: true,
      schema: schema,
      jsonLd: JSON.stringify(schema, null, 2),
      implementation: "Add this JSON-LD script to your Squarespace header",
    };
  }

  /**
   * Generate Service schema markup for individual service pages
   */
  generateServiceSchema(serviceKey) {
    if (!this.services[serviceKey]) {
      return {
        success: false,
        error: `Service '${serviceKey}' not found. Available: ${Object.keys(this.services).join(", ")}`,
      };
    }

    const service = this.services[serviceKey];
    const schema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${this.website}/services/${serviceKey}#service`,
      name: service.name,
      description: service.description,
      provider: {
        "@type": "LocalBusiness",
        "@id": `${this.website}#localbusiness`,
        name: this.businessName,
        telephone: this.phone,
        email: this.email,
        url: this.website,
        address: {
          "@type": "PostalAddress",
          addressLocality: this.address.addressLocality,
          addressRegion: this.address.addressRegion,
          addressCountry: this.address.addressCountry,
        },
      },
      areaServed: this.serviceLocations.map((location) => ({
        "@type": "City",
        name: location,
      })),
      serviceType: service.name,
      category: "Home Organization",
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: service.name,
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              "@id": `${this.website}/services/${serviceKey}#service`,
            },
            priceRange: service.priceRange,
            priceCurrency: "USD",
          },
        ],
      },
    };

    return {
      success: true,
      service: service.name,
      schema: schema,
      jsonLd: JSON.stringify(schema, null, 2),
      implementation: `Add this JSON-LD script to your ${service.name} service page`,
    };
  }

  /**
   * Generate FAQ schema with voice search optimization
   */
  generateFAQSchema() {
    const faqs = [
      {
        question: "How much does a professional organizer cost in Missoula?",
        answer:
          "ClutterFree Spaces charges $200-$3000 depending on the project scope. Single room organization starts at $200, while whole house projects range from $1200-$3000. We offer free consultations to provide accurate estimates based on your specific needs.",
      },
      {
        question: "What areas does ClutterFree Spaces serve in Montana?",
        answer:
          "We serve Missoula and surrounding Western Montana areas including Hamilton, Stevensville, Florence, Lolo, and the Bitterroot Valley. Contact us to confirm service availability in your specific location.",
      },
      {
        question: "How long does whole house organization take?",
        answer:
          "Whole house organization typically takes 2-5 days depending on home size and clutter level. We work efficiently to minimize disruption to your daily routine while ensuring every system is sustainable and functional.",
      },
      {
        question: "Do you organize RVs and motorhomes in Montana?",
        answer:
          "Yes! ClutterFree Spaces specializes in RV organization with storage solutions designed for Montana's outdoor lifestyle. Our RV services take 4-8 hours and create efficient systems for travel gear, clothing, and supplies.",
      },
      {
        question:
          "What makes ClutterFree Spaces different from other organizers?",
        answer:
          "We focus on creating sustainable systems that work for YOUR lifestyle, not just making spaces look pretty. Our Montana-based approach understands seasonal storage needs, outdoor gear organization, and the unique challenges of organizing mountain homes.",
      },
      {
        question: "Do you help with downsizing and estate organization?",
        answer:
          "Absolutely. We provide compassionate downsizing assistance for seniors and families, including estate organization, donation coordination, and moving support. Our goal is to make transitions as smooth as possible while honoring precious memories.",
      },
    ];

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

    return {
      success: true,
      faqCount: faqs.length,
      schema: schema,
      jsonLd: JSON.stringify(schema, null, 2),
      faqs: faqs,
      implementation: "Add this JSON-LD script to your FAQ section or homepage",
    };
  }

  /**
   * Generate optimized page titles for different page types
   */
  generatePageTitles() {
    return {
      success: true,
      titles: {
        homepage:
          "ClutterFree Spaces | Professional Home Organizer Missoula Montana",
        about:
          "About Chanel | Professional Organizer Missoula MT | ClutterFree Spaces",
        services:
          "Home Organization Services Missoula Montana | ClutterFree Spaces",
        contact:
          "Contact ClutterFree Spaces | Professional Organizer Missoula MT",
        servicePages: Object.entries(this.services).reduce(
          (acc, [key, service]) => {
            acc[key] =
              `${service.name} Missoula MT | ClutterFree Spaces Montana`;
            return acc;
          },
          {},
        ),
      },
    };
  }

  /**
   * Generate optimized meta descriptions
   */
  generateMetaDescriptions() {
    return {
      success: true,
      descriptions: {
        homepage:
          "ClutterFree Spaces transforms Montana homes with professional organization services. Serving Missoula & Western Montana. Call (406) 285-1525 for your free consultation today!",
        about:
          "Meet Chanel, professional organizer and founder of ClutterFree Spaces in Missoula, Montana. Transforming homes with sustainable organization systems since 2023.",
        services:
          "Professional home organization services in Missoula: whole house, RV, garage, and room organization. Montana's trusted organizing experts. Free consultations available.",
        contact:
          "Ready to transform your space? Contact ClutterFree Spaces in Missoula, Montana. Call (406) 285-1525 or email for your free organizing consultation.",
        servicePages: Object.entries(this.services).reduce(
          (acc, [key, service]) => {
            acc[key] =
              `${service.description} Professional ${service.name.toLowerCase()} in Missoula, Montana. Call (406) 285-1525 for your free consultation.`;
            return acc;
          },
          {},
        ),
      },
    };
  }

  /**
   * Generate keyword-rich content for service pages
   */
  generateServicePageContent(serviceKey) {
    if (!this.services[serviceKey]) {
      return {
        success: false,
        error: `Service '${serviceKey}' not found`,
      };
    }

    const service = this.services[serviceKey];
    const keywords = service.keywords;

    // Generate content sections
    const content = {
      hero: {
        headline: `Professional ${service.name} in Missoula, Montana`,
        subheadline: `Transform your space with ClutterFree Spaces' expert ${service.name.toLowerCase()} services`,
        cta: "Schedule Your Free Consultation Today",
      },

      overview: `
        <h2>Expert ${service.name} Services in Western Montana</h2>
        <p>${service.description} At ClutterFree Spaces, we understand that ${keywords[0]} requires more than just moving items around – it requires creating sustainable systems that work for your Montana lifestyle.</p>
        
        <p>Serving Missoula and surrounding Western Montana communities, our ${service.name.toLowerCase()} process is designed to maximize functionality while respecting your time and budget. Whether you're dealing with seasonal gear storage, family organization challenges, or simply want to reclaim your space, we're here to help.</p>
      `,

      process: `
        <h2>Our ${service.name} Process</h2>
        <h3>1. Free Consultation</h3>
        <p>We start with a comprehensive assessment of your space and organization goals. This helps us understand your unique needs and create a customized plan.</p>
        
        <h3>2. Strategic Planning</h3>
        <p>Based on your lifestyle and preferences, we design organization systems that are both functional and sustainable for long-term success.</p>
        
        <h3>3. Implementation</h3>
        <p>Our efficient ${service.name.toLowerCase()} process typically takes ${service.duration}, minimizing disruption to your daily routine while maximizing results.</p>
        
        <h3>4. Follow-Up Support</h3>
        <p>We provide ongoing support and tips to ensure your newly organized space maintains its functionality over time.</p>
      `,

      benefits: `
        <h2>Benefits of Professional ${service.name}</h2>
        <ul>
          <li><strong>Save Time:</strong> Stop searching for items and enjoy more time for what matters most</li>
          <li><strong>Reduce Stress:</strong> Organized spaces create calm, peaceful environments</li>
          <li><strong>Maximize Space:</strong> Discover hidden storage potential you never knew existed</li>
          <li><strong>Sustainable Systems:</strong> Learn organization methods that last long-term</li>
          <li><strong>Professional Expertise:</strong> Benefit from years of organizing experience and Montana-specific solutions</li>
        </ul>
      `,

      serviceArea: `
        <h2>${service.name} Services Throughout Western Montana</h2>
        <p>ClutterFree Spaces proudly serves the following Montana communities:</p>
        <ul>
          ${this.serviceLocations.map((location) => `<li>${location}</li>`).join("\n          ")}
        </ul>
        <p>Not sure if we serve your area? <a href="/contact">Contact us</a> to confirm service availability in your location.</p>
      `,

      cta: `
        <h2>Ready to Transform Your Space?</h2>
        <p>Don't let clutter control your life any longer. Contact ClutterFree Spaces today for your free ${service.name.toLowerCase()} consultation in Missoula, Montana.</p>
        <p><strong>Call:</strong> <a href="tel:+14062851525">(406) 285-1525</a><br>
        <strong>Email:</strong> <a href="mailto:contact@clutter-free-spaces.com">contact@clutter-free-spaces.com</a></p>
      `,
    };

    return {
      success: true,
      service: service.name,
      duration: service.duration,
      priceRange: service.priceRange,
      keywords: keywords,
      content: content,
      estimatedWordCount: Object.values(content)
        .join(" ")
        .replace(/<[^>]*>/g, "")
        .split(" ").length,
    };
  }

  /**
   * Generate comprehensive SEO package for all pages
   */
  generateCompleteSEOPackage() {
    const seoPackage = {
      schemas: {
        localBusiness: this.generateLocalBusinessSchema(),
        services: {},
        faq: this.generateFAQSchema(),
      },
      pageTitles: this.generatePageTitles(),
      metaDescriptions: this.generateMetaDescriptions(),
      serviceContent: {},
    };

    // Generate service schemas and content
    Object.keys(this.services).forEach((serviceKey) => {
      seoPackage.schemas.services[serviceKey] =
        this.generateServiceSchema(serviceKey);
      seoPackage.serviceContent[serviceKey] =
        this.generateServicePageContent(serviceKey);
    });

    return {
      success: true,
      package: seoPackage,
      summary: {
        schemasGenerated: Object.keys(seoPackage.schemas.services).length + 2, // +2 for LocalBusiness and FAQ
        servicePagesReady: Object.keys(seoPackage.serviceContent).length,
        totalKeywords: Object.values(this.services).reduce(
          (total, service) => total + service.keywords.length,
          0,
        ),
        estimatedPageWordCount: Object.values(seoPackage.serviceContent).reduce(
          (total, content) => total + content.estimatedWordCount,
          0,
        ),
      },
      implementation: {
        step1: "Add LocalBusiness schema to homepage header",
        step2: "Create service pages with provided content and Service schemas",
        step3: "Add FAQ schema to homepage or dedicated FAQ section",
        step4: "Update all page titles and meta descriptions",
        step5: "Submit updated sitemap to Google Search Console",
      },
    };
  }
}

module.exports = new SEOService();
