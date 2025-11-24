// Organization Schema for all pages
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "UK Innovator Founder Visa Assistant",
  "url": "https://innovatorfoundervisaassistant.co.uk",
  "logo": "https://innovatorfoundervisaassistant.co.uk/logo.png",
  "description": "AI-powered platform providing 109 expert tools for UK Innovator Founder Visa applications. PhD-level guidance covering compliance, business planning, financial modeling, and endorsement preparation.",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "email": "support@innovatorfoundervisaassistant.co.uk",
    "availableLanguage": ["English"]
  },
  "founder": {
    "@type": "Organization",
    "name": "UK Innovator Founder Visa Assistant Team"
  }
};

// SoftwareApplication Schema for main app
export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "UK Innovator Founder Visa Assistant",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "0",
    "highPrice": "129",
    "priceCurrency": "GBP",
    "offerCount": "5"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "157",
    "bestRating": "5",
    "worstRating": "1"
  },
  "description": "Comprehensive UK Innovator Founder Visa application toolkit with 109 PhD-level tools for compliance, business planning, and endorsement success."
};

// FAQ Schema for common questions
export const visaFAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the UK Innovator Founder Visa?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The UK Innovator Founder Visa is for entrepreneurs who want to establish an innovative, viable, and scalable business in the UK. It requires endorsement from an approved body and a minimum £50,000 investment in your business."
      }
    },
    {
      "@type": "Question",
      "name": "How much does the UK Innovator Founder Visa cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The visa application fee is £1,191 if applying from outside the UK, or £1,486 if applying from within the UK. You also need £1,270 in savings for 28 consecutive days and a minimum £50,000 investment in your business."
      }
    },
    {
      "@type": "Question",
      "name": "What are the Innovation, Viability, and Scalability criteria?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Innovation: Your business must be genuinely innovative and different from existing UK market solutions. Viability: You must demonstrate that your business model is realistic and sustainable. Scalability: Your business must have potential for significant growth in the UK market and job creation."
      }
    },
    {
      "@type": "Question",
      "name": "How long does the UK Innovator Founder Visa process take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Standard processing takes 3-8 weeks from outside the UK. Priority service (£500-£800) reduces this to 5 working days, while Super Priority (£800-£1,000) offers next-day decisions. Endorsement from an approved body typically takes 4-12 weeks."
      }
    },
    {
      "@type": "Question",
      "name": "Which endorsing bodies approve Innovator Founder Visas?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Approved endorsing bodies include Innovator International, The Global Entrepreneurs Programme, Envestors Limited, and several UK universities. Each has different application processes, fees, and approval criteria."
      }
    }
  ]
};

// Breadcrumb Schema
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

// Product/Service Schema for pricing tiers
export const createPricingSchema = (tierName: string, price: string, features: string[]) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": `${tierName} - UK Innovator Founder Visa Assistant`,
  "description": `${tierName} plan for UK Innovator Founder Visa application assistance`,
  "brand": {
    "@type": "Brand",
    "name": "UK Innovator Founder Visa Assistant"
  },
  "offers": {
    "@type": "Offer",
    "price": price === "Free" ? "0" : price.replace("£", ""),
    "priceCurrency": "GBP",
    "availability": "https://schema.org/InStock",
    "url": "https://innovatorfoundervisaassistant.co.uk/pricing"
  },
  "additionalProperty": features.map(feature => ({
    "@type": "PropertyValue",
    "name": "Feature",
    "value": feature
  }))
});

// Article Schema for blog/guide content
export const createArticleSchema = (title: string, description: string, datePublished: string, author: string = "UK Innovator Founder Visa Assistant Team") => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "author": {
    "@type": "Organization",
    "name": author
  },
  "publisher": {
    "@type": "Organization",
    "name": "UK Innovator Founder Visa Assistant",
    "logo": {
      "@type": "ImageObject",
      "url": "https://innovatorfoundervisaassistant.co.uk/logo.png"
    }
  },
  "datePublished": datePublished,
  "dateModified": new Date().toISOString().split('T')[0]
});

// FAQ Schema generator for dynamic FAQ pages
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
