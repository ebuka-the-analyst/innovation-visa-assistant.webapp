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
  ogImage,
  ogType = 'website',
  keywords,
  schema,
  schemas
}: SEOHeadProps) {
  useEffect(() => {
    const currentPath =
      window.location.pathname.length > 1 && window.location.pathname.endsWith("/")
        ? window.location.pathname.slice(0, -1)
        : window.location.pathname;
    const approvedPath = document
      .querySelector('meta[name="seo-autopilot-path"]')
      ?.getAttribute("content");
    const approvedTitle = document
      .querySelector('meta[name="seo-autopilot-title"]')
      ?.getAttribute("content");
    const approvedDescription = document
      .querySelector('meta[name="seo-autopilot-description"]')
      ?.getAttribute("content");

    const useApprovedOverride =
      Boolean(approvedPath) &&
      approvedPath === currentPath &&
      Boolean(approvedTitle) &&
      Boolean(approvedDescription);

    const effectiveTitle = useApprovedOverride ? approvedTitle! : title;
    const effectiveDescription = useApprovedOverride
      ? approvedDescription!
      : description;
    const resolvedOgImage =
      ogImage || `${window.location.origin}/og-image.webp`;
    const siteName = window.location.hostname.includes("visaassistant.global")
      ? "Visa Assistant Global"
      : "UK Innovator Founder Visa Assistant";

    // Set title. Approved autopilot metadata wins when the server marked this
    // exact path with an approved override.
    document.title = effectiveTitle;

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
    setMeta('description', effectiveDescription);
    if (keywords) {
      setMeta('keywords', keywords);
    }
    setMeta('robots', 'index, follow');
    setMeta('googlebot', 'index, follow');
    
    // Open Graph tags
    setMeta('og:title', effectiveTitle, true);
    setMeta('og:description', effectiveDescription, true);
    setMeta('og:type', ogType, true);
    setMeta('og:url', canonical || window.location.href, true);
    setMeta('og:image', resolvedOgImage, true);
    setMeta('og:site_name', siteName, true);
    
    // Twitter Card tags
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', effectiveTitle);
    setMeta('twitter:description', effectiveDescription);
    setMeta('twitter:image', resolvedOgImage);
    
    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    const innovatorOrigin = "https://innovatorfoundervisaassistant.co.uk";
    const isGlobalHost = window.location.hostname.includes("visaassistant.global");
    const innovatorOwnedPaths = new Set([
      "/guide",
      "/faq",
      "/eligibility",
      "/endorsing-bodies",
      "/business-plan-template",
      "/guide/ultimate-uk-innovator-founder-visa-guide",
      "/blog",
    ]);
    const canonicalPath =
      path ||
      (window.location.pathname.length > 1 &&
      window.location.pathname.endsWith("/")
        ? window.location.pathname.slice(0, -1)
        : window.location.pathname);
    const isInnovatorOwnedOnGlobal =
      isGlobalHost &&
      (innovatorOwnedPaths.has(canonicalPath) ||
        canonicalPath.startsWith("/blog/"));
    const fullCanonical = isInnovatorOwnedOnGlobal
      ? `${innovatorOrigin}${canonicalPath}`
      : canonical ||
        (path ? `${window.location.origin}${path}` : window.location.href);
    canonicalLink.href = fullCanonical;
    setMeta('og:url', fullCanonical, true);

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
