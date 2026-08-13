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
  "description": "AI-powered platform providing professional-level tools for UK Innovator Founder Visa applications. Covers compliance, business planning, financial modelling, and endorsement preparation.",
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
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "157",
    "bestRating": "5",
    "worstRating": "1"
  },
  "description": "Comprehensive UK Innovator Founder Visa application toolkit for compliance, business planning, and endorsement success."
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "UK Innovator Founder Visa Assistant",
  "url": BASE,
  "description": "The UK's leading AI-powered platform for Innovator Founder Visa applications.",
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
        "text": "The UK Innovator Founder Visa is for entrepreneurs who want to establish an innovative, viable, and scalable business in the UK. It requires endorsement from one of four Home Office-approved endorsing bodies: Envestors, Innovator International, UK Endorsing Services (UKES), or the Global Entrepreneurs Programme (invitation only)."
      }
    },
    {
      "@type": "Question",
      "name": "How much does the UK Innovator Founder Visa cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The visa application fee is £1,191 whether applying from inside or outside the UK. You also need to show £1,270 in personal savings held for at least 28 consecutive days. There is no minimum business investment requirement for this visa route."
      }
    },
    {
      "@type": "Question",
      "name": "What are the Innovation, Viability, and Scalability criteria?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Innovation: Your business must be genuinely new or significantly different from existing UK market solutions. Viability: You must demonstrate the skills, knowledge, and experience to successfully run the business. Scalability: Your business must have clear potential for growth and job creation in the UK."
      }
    },
    {
      "@type": "Question",
      "name": "How long does the UK Innovator Founder Visa process take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Standard processing typically takes 3–8 weeks from submission. A priority service costing £500 is available where processing is faster. Endorsement from an approved body typically takes 4–12 weeks depending on the body chosen."
      }
    },
    {
      "@type": "Question",
      "name": "Which bodies endorse Innovator Founder Visa applications?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "There are four Home Office-approved endorsing bodies as of October 2024: Envestors Limited (envestors.co.uk), Innovator International Limited (innovatorinternational.com), UK Endorsing Services / UKES (ukesapp.co.uk), and the Global Entrepreneurs Programme (invitation only — cannot be applied to directly)."
      }
    },
    {
      "@type": "Question",
      "name": "How long is the Innovator Founder Visa valid?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The visa is initially granted for 3 years. It can be extended for a further 3 years if you continue to meet the requirements. After 3 years on the visa, you may be eligible to apply for Indefinite Leave to Remain (ILR/settlement), which costs £2,885."
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
  },
  "reviewedBy": [
    { "@type": "Organization", "name": "Gemini AI" },
    { "@type": "Organization", "name": "OpenAI GPT-4o" },
    { "@type": "Organization", "name": "Claude AI" },
    { "@type": "Organization", "name": "Qwen AI" }
  ]
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
  "description": `${tierName} plan for UK Innovator Founder Visa application assistance`,
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
    "url": `${BASE}/pricing`,
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "0",
        "currency": "GBP"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "GB"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": "0",
          "maxValue": "0",
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": "0",
          "maxValue": "0",
          "unitCode": "DAY"
        }
      }
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": "GB",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 14,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/FreeReturn"
    }
  },
  "additionalProperty": features.map(feature => ({
    "@type": "PropertyValue",
    "name": "Feature",
    "value": feature
  }))
});
