import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: 'website' | 'article';
  schema?: Record<string, any> | Array<Record<string, any>>;
}

export function useSEO({ title, description, canonical, ogType = 'website', schema }: SEOProps) {
  useEffect(() => {
    // 1. Update Title
    const formattedTitle = title ? `${title} | SPA24` : 'SPA24 | Find Spas & Wellness Services Near You';
    document.title = formattedTitle;

    // 2. Update Meta Description
    const defaultDesc = 'Search genuine spa and wellness businesses by city, area, and service. Verified directory with opening hours, services, and booking links.';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || defaultDesc);
    }

    // 3. Update OG Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', formattedTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description || defaultDesc);

    const ogTypeMeta = document.querySelector('meta[property="og:type"]');
    if (ogTypeMeta) ogTypeMeta.setAttribute('content', ogType);

    // 4. Update Canonical
    const currentUrl = canonical || window.location.href;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 5. Inject Structured Data JSON-LD
    let scriptTag = document.querySelector('script#spa24-jsonld') as HTMLScriptElement | null;
    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'spa24-jsonld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.text = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Clean up script tag on unmount if needed
      const tag = document.querySelector('script#spa24-jsonld');
      if (tag) tag.remove();
    };
  }, [title, description, canonical, ogType, schema]);
}
