const BASE = "https://innovatorfoundervisaassistant.co.uk";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "UK Innovator Founder Visa Assistant",
  "alternateName": "IFVA",
  "url": BASE,
  "logo": {
    "@type": "ImageObject",
    "url": `${BASE}/og-image.webp`,
    "width": 1200,
    "height": 630
  },
  "description": "Software platform providing AI-assisted business planning, preparation tools and selected official GOV.UK updates for UK Innovator Founder applicants. The platform does not provide regulated immigration advice or guarantee outcomes.",
  "foundingDate": "2025",
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

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "UK Innovator Founder Visa Assistant",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "url": BASE,
  "description": "AI-assisted business-planning and application-preparation toolkit for the UK Innovator Founder route. It is not a regulated immigration adviser or visa decision-maker."
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "UK Innovator Founder Visa Assistant",
  "url": BASE,
  "description": "AI-assisted planning, evidence organisation and official update tracking for UK Innovator Founder application preparation.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${BASE}/tools?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};

export const visaFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the UK Innovator Founder Visa?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Innovator Founder route is for people seeking to establish a UK business based on an innovative, viable and scalable business idea. An application must be supported by an authorised endorsing body and must meet the current Immigration Rules."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a fixed minimum business investment requirement for a new Innovator Founder application?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The current GOV.UK eligibility guidance does not state a universal fixed minimum business investment amount for every new Innovator Founder applicant. New-business applicants need to demonstrate sufficient funding for their business and where it comes from. Always check the current rules and guidance before applying."
      }
    },
    {
      "@type": "Question",
      "name": "What are the Innovation, Viability and Scalability criteria?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For a new business, the Immigration Rules require a genuine and original business plan that meets market needs and/or creates a competitive advantage, is realistic and achievable based on available resources and founder capability, and shows structured planning with potential for job creation and national and international growth."
      }
    },
    {
      "@type": "Question",
      "name": "How long does an Innovator Founder application take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Processing and endorsement timelines can change and depend on individual circumstances and the endorsing body. Check the current GOV.UK processing-time guidance and the selected endorsing body's published information before planning around a deadline."
      }
    },
    {
      "@type": "Question",
      "name": "Which bodies can endorse Innovator Founder applications?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Only organisations on the current GOV.UK list of authorised Innovator Founder endorsing bodies can issue an endorsement for the route. The list can change, so applicants should verify the current GOV.UK publication before relying on any third-party list."
      }
    },
    {
      "@type": "Question",
      "name": "Can the Innovator Founder route lead to settlement?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Innovator Founder route can lead to settlement. Current GOV.UK guidance states that a person may be eligible after the qualifying period if they also meet the applicable residence, endorsement and business-achievement requirements. Eligibility must be assessed against the rules in force at the time of application."
      }
    }
  ]
};

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const createBlogPostingSchema = (
  title: string,
  description: string,
  datePublished: string,
  slug: string,
  image?: string,
  readingTime?: number,
  tags?: string[]
) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": title,
  "description": description,
  "image": image ? (image.startsWith("http") ? image : `${BASE}${image}`) : `${BASE}/og-image.webp`,
  "author": {
    "@type": "Organization",
    "name": "UK Innovator Founder Visa Assistant Team",
    "url": BASE
  },
  "publisher": {
    "@type": "Organization",
    "name": "UK Innovator Founder Visa Assistant",
    "url": BASE,
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE}/og-image.webp`,
      "width": 1200,
      "height": 630
    }
  },
  "datePublished": datePublished,
  "dateModified": datePublished,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `${BASE}/blog/${slug}`
  },
  "timeRequired": `PT${readingTime ?? 8}M`,
  "keywords": tags?.join(", "),
  "about": {
    "@type": "Thing",
    "name": "UK Innovator Founder Visa"
  }
});

export const createArticleSchema = (
  title: string,
  description: string,
  datePublished: string,
  author = "UK Innovator Founder Visa Assistant Team"
) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "author": {
    "@type": "Organization",
    "name": author,
    "url": BASE
  },
  "publisher": {
    "@type": "Organization",
    "name": "UK Innovator Founder Visa Assistant",
    "url": BASE,
    "logo": {
      "@type": "ImageObject",
      "url": `${BASE}/og-image.webp`,
      "width": 1200,
      "height": 630
    }
  },
  "datePublished": datePublished,
  "dateModified": new Date().toISOString().split("T")[0]
});

export const createFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
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
});

export const createToolSchema = (name: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": `${name} | UK Innovator Founder Visa Assistant`,
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "url": `${BASE}${url}`,
  "description": description,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "GBP"
  },
  "provider": {
    "@type": "Organization",
    "name": "UK Innovator Founder Visa Assistant",
    "url": BASE
  }
});

export const createPricingSchema = (
  tierName: string,
  pricePence: number,
  features: string[],
  currency = "GBP",
) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": `${tierName} — UK Innovator Founder Visa Assistant`,
  "description": `${tierName} plan for UK Innovator Founder application-preparation tools`,
  "image": `${BASE}/og-image.webp`,
  "brand": {
    "@type": "Brand",
    "name": "UK Innovator Founder Visa Assistant"
  },
  "offers": {
    "@type": "Offer",
    "price": (pricePence / 100).toFixed(2),
    "priceCurrency": currency,
    "availability": "https://schema.org/InStock",
    "url": `${BASE}/pricing`
  },
  "additionalProperty": features.map(feature => ({
    "@type": "PropertyValue",
    "name": "Feature",
    "value": feature
  }))
});
