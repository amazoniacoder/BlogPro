// Sitemap generation utility for multi-language support
export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates?: { lang: string; href: string }[];
}

export const generateSitemap = (urls: SitemapUrl[]): string => {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">';
  const urlsetClose = '</urlset>';
  
  const urlElements = urls.map(url => {
    let urlXml = `  <url>
    <loc>${url.loc}</loc>`;
    
    if (url.lastmod) {
      urlXml += `
    <lastmod>${url.lastmod}</lastmod>`;
    }
    
    if (url.changefreq) {
      urlXml += `
    <changefreq>${url.changefreq}</changefreq>`;
    }
    
    if (url.priority) {
      urlXml += `
    <priority>${url.priority}</priority>`;
    }
    
    if (url.alternates) {
      url.alternates.forEach(alt => {
        urlXml += `
    <xhtml:link rel="alternate" hreflang="${alt.lang}" href="${alt.href}" />`;
      });
    }
    
    urlXml += `
  </url>`;
    
    return urlXml;
  }).join('\n');
  
  return `${xmlHeader}
${urlsetOpen}
${urlElements}
${urlsetClose}`;
};

export const getBlogSitemapUrls = async (): Promise<SitemapUrl[]> => {
  const baseUrl = window.location.origin;
  const urls: SitemapUrl[] = [];
  
  // Main blog page
  urls.push({
    loc: `${baseUrl}/blog`,
    changefreq: 'daily',
    priority: 0.8,
    alternates: [
      { lang: 'en', href: `${baseUrl}/blog` },
      { lang: 'ru', href: `${baseUrl}/blog` }
    ]
  });
  
  return urls;
};
