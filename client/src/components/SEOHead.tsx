import { useEffect } from 'react';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  path?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  keywords?: string;
  schema?: object;
  schemas?: object[];
}

export function SEOHead({
  title,
  description,
  canonical,
  path,
  ogImage = 'https://innovatorfoundervisaassistant.co.uk/og-image.webp',
  ogType = 'website',
  keywords,
  schema,
  schemas
}: SEOHeadProps) {
  useEffect(() => {
    // Set title
    document.title = title;

    // Set or update meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    setMeta('description', description);
    if (keywords) {
      setMeta('keywords', keywords);
    }
    setMeta('robots', 'index, follow');
    setMeta('googlebot', 'index, follow');
    
    // Open Graph tags
    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', ogType, true);
    setMeta('og:url', canonical || window.location.href, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:site_name', 'UK Innovator Founder Visa Assistant', true);
    
    // Twitter Card tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);
    
    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    const fullCanonical = canonical || (path ? `https://innovatorfoundervisaassistant.co.uk${path}` : window.location.href);
    canonicalLink.href = fullCanonical;

    // Schema.org structured data
    const schemaData = schemas || (schema ? [schema] : []);
    
    // Remove existing schema scripts
    const existingSchemas = document.querySelectorAll('script[type="application/ld+json"].dynamic-schema');
    existingSchemas.forEach(s => s.remove());
    
    // Add new schema scripts
    schemaData.forEach((schemaItem, index) => {
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.className = 'dynamic-schema';
      schemaScript.textContent = JSON.stringify(schemaItem);
      document.head.appendChild(schemaScript);
    });
  }, [title, description, canonical, path, ogImage, ogType, keywords, schema, schemas]);

  return null;
}
