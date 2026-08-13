const BASE_URL = 'https://innovatorfoundervisaassistant.co.uk';

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "UK Innovator Founder Visa Assistant",
  "alternateName": "IFVA",
  "url": BASE_URL,
  "logo": `${BASE_URL}/og-image.webp`,
  "description": "AI-powered platform for Innovator Founder Visa applications, with expert guidance, business plan generation, and professional tools.",
  "foundingDate": "2024",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "GB"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "availableLanguage": ["English"]
  },
  "sameAs": [
    "https://twitter.com/innovatorvisa",
    "https://linkedin.com/company/innovator-visa-assistant"
  ]
};

export const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "UK Innovator Founder Visa Assistant",
  "url": BASE_URL,
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "147",
    "bestRating": "5",
    "worstRating": "1"
  },
  "featureList": [
    "AI Business Plan Generator",
    "Innovation Score Calculator",
    "Eligibility Assessment",
    "Document Management",
    "Endorsing Body Comparison",
    "Professional Visa Tools"
  ]
};

export const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Visa Application Assistance",
  "provider": {
    "@type": "Organization",
    "name": "UK Innovator Founder Visa Assistant"
  },
  "areaServed": {
    "@type": "Country",
    "name": "United Kingdom"
  },
  "description": "Comprehensive AI-powered assistance for UK Innovator Founder Visa applications including business plan generation, document preparation, and endorsing body guidance."
};

export function createFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function createHowToSchema(
  name: string,
  description: string,
  steps: Array<{ name: string; text: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text
    }))
  };
}

export function createArticleSchema(
  headline: string,
  description: string,
  datePublished: string,
  dateModified: string,
  imageUrl?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "datePublished": datePublished,
    "dateModified": dateModified,
    "author": {
      "@type": "Organization",
      "name": "UK Innovator Founder Visa Assistant"
    },
    "publisher": {
      "@type": "Organization",
      "name": "UK Innovator Founder Visa Assistant",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/og-image.webp`
      }
    },
    "image": imageUrl || `${BASE_URL}/og-image.webp`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": BASE_URL
    }
  };
}

export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}

export function createProductSchema(
  name: string,
  description: string,
  price?: string,
  priceCurrency: string = "GBP"
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    ...(price ? {
      "offers": {
        "@type": "Offer",
        "priceCurrency": priceCurrency,
        "price": price,
        "availability": "https://schema.org/InStock"
      }
    } : {}),
    "brand": {
      "@type": "Organization",
      "name": "UK Innovator Founder Visa Assistant"
    }
  };
}

export function createLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "UK Innovator Founder Visa Assistant",
    "description": "AI-powered UK Innovator Founder Visa application assistance platform",
    "url": BASE_URL,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "51.5074",
      "longitude": "-0.1278"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      "opens": "00:00",
      "closes": "23:59"
    }
  };
}

export const visaRequirementsSchema = createHowToSchema(
  "How to Apply for UK Innovator Founder Visa in 2025",
  "Complete step-by-step guide to successfully applying for the UK Innovator Founder Visa",
  [
    { name: "Check Eligibility", text: "Verify you meet the basic requirements: innovative business idea, endorsement from approved body, English language proficiency, and maintenance funds." },
    { name: "Develop Business Plan", text: "Create a comprehensive business plan demonstrating innovation, viability, and scalability for your UK-based business." },
    { name: "Secure Endorsement", text: "Apply to one of the UK's approved endorsing bodies and obtain endorsement for your business idea." },
    { name: "Gather Documents", text: "Collect all required documents including passport, TB test certificate, criminal record certificate, and financial evidence." },
    { name: "Complete Online Application", text: "Submit your visa application through the UK Visas and Immigration online portal." },
    { name: "Attend Biometrics Appointment", text: "Book and attend your biometrics appointment at a visa application centre." },
    { name: "Wait for Decision", text: "Processing typically takes 3-8 weeks. You'll receive notification of the decision via email." }
  ]
);

export const endorsingBodiesListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "UK Innovator Founder Visa Endorsing Bodies 2025",
  "description": "Complete list of approved endorsing bodies for the UK Innovator Founder Visa",
  "numberOfItems": 40,
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Tech Nation" },
    { "@type": "ListItem", "position": 2, "name": "Seedcamp" },
    { "@type": "ListItem", "position": 3, "name": "Founders Factory" },
    { "@type": "ListItem", "position": 4, "name": "Entrepreneur First" },
    { "@type": "ListItem", "position": 5, "name": "Bethnal Green Ventures" }
  ]
};
