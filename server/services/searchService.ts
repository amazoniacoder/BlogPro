import { db } from '../db/db';
import { blogPosts } from '../../shared/types/schema';
import { sql } from 'drizzle-orm';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'blog' | 'product' | 'documentation';
  relevance: number;
}

export interface UnifiedSearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  language: 'en' | 'ru';
}

export class SearchService {
  private getLanguageConfig(language: 'en' | 'ru'): string {
    return language === 'ru' ? 'russian' : 'english';
  }

  detectLanguage(query: string): 'en' | 'ru' {
    const cyrillicPattern = /[а-яё]/i;
    return cyrillicPattern.test(query) ? 'ru' : 'en';
  }

  async searchBlog(query: string, language: 'en' | 'ru' = 'en', limit: number = 10): Promise<SearchResult[]> {
    const langConfig = this.getLanguageConfig(language);
    
    const results = await db.execute(sql`
      SELECT 
        id::text,
        title,
        description,
        slug,
        GREATEST(
          ts_rank(to_tsvector(${langConfig}, title || ' ' || description || ' ' || content), plainto_tsquery(${langConfig}, ${query})),
          CASE WHEN title ILIKE ${'%' + query + '%'} THEN 0.9 ELSE 0 END,
          CASE WHEN description ILIKE ${'%' + query + '%'} THEN 0.7 ELSE 0 END
        ) as relevance
      FROM ${blogPosts}
      WHERE (
        to_tsvector(${langConfig}, title || ' ' || description || ' ' || content) @@ plainto_tsquery(${langConfig}, ${query})
        OR title ILIKE ${'%' + query + '%'}
        OR description ILIKE ${'%' + query + '%'}
        OR content ILIKE ${'%' + query + '%'}
      )
      ORDER BY relevance DESC
      LIMIT ${limit}
    `);

    return results.rows.map(row => ({
      id: String(row.id),
      title: String(row.title),
      description: String(row.description || ''),
      url: `/blog/${row.slug}`,
      type: 'blog' as const,
      relevance: parseFloat(String(row.relevance))
    }));
  }

  async searchProducts(query: string, language: 'en' | 'ru' = 'en', limit: number = 10): Promise<SearchResult[]> {
    const langConfig = this.getLanguageConfig(language);
    
    const results = await db.execute(sql`
      SELECT 
        id::text,
        title,
        description,
        slug,
        GREATEST(
          ts_rank(to_tsvector(${langConfig}, title || ' ' || description || ' ' || content), plainto_tsquery(${langConfig}, ${query})),
          CASE WHEN title ILIKE ${'%' + query + '%'} THEN 0.9 ELSE 0 END,
          CASE WHEN description ILIKE ${'%' + query + '%'} THEN 0.7 ELSE 0 END
        ) as relevance
      FROM products
      WHERE (
        to_tsvector(${langConfig}, title || ' ' || description || ' ' || content) @@ plainto_tsquery(${langConfig}, ${query})
        OR title ILIKE ${'%' + query + '%'}
        OR description ILIKE ${'%' + query + '%'}
        OR content ILIKE ${'%' + query + '%'}
      ) AND is_active = true
      ORDER BY relevance DESC
      LIMIT ${limit}
    `);

    return results.rows.map(row => ({
      id: String(row.id),
      title: String(row.title),
      description: String(row.description || ''),
      url: `/products/${row.slug}`,
      type: 'product' as const,
      relevance: parseFloat(String(row.relevance))
    }));
  }

  async searchDocumentation(query: string, language: 'en' | 'ru' = 'en', limit: number = 10): Promise<SearchResult[]> {
    const langConfig = this.getLanguageConfig(language);
    
    const results = await db.execute(sql`
      SELECT 
        d.id::text,
        d.title,
        d.excerpt as description,
        d.slug,
        GREATEST(
          ts_rank(to_tsvector(${langConfig}, d.title || ' ' || d.excerpt || ' ' || d.content), plainto_tsquery(${langConfig}, ${query})),
          CASE WHEN d.title ILIKE ${'%' + query + '%'} THEN 0.9 ELSE 0 END,
          CASE WHEN d.excerpt ILIKE ${'%' + query + '%'} THEN 0.7 ELSE 0 END
        ) as relevance
      FROM documentation d
      WHERE (
        to_tsvector(${langConfig}, d.title || ' ' || d.excerpt || ' ' || d.content) @@ plainto_tsquery(${langConfig}, ${query})
        OR d.title ILIKE ${'%' + query + '%'}
        OR d.excerpt ILIKE ${'%' + query + '%'}
        OR d.content ILIKE ${'%' + query + '%'}
      ) AND d.is_published = true
      ORDER BY relevance DESC
      LIMIT ${limit}
    `);

    return results.rows.map(row => ({
      id: String(row.id),
      title: String(row.title),
      description: String(row.description || ''),
      url: `/documentation/${row.slug}`,
      type: 'documentation' as const,
      relevance: parseFloat(String(row.relevance))
    }));
  }

  async searchAll(query: string, language?: 'en' | 'ru', limit: number = 30): Promise<UnifiedSearchResponse> {
    const detectedLang = language || this.detectLanguage(query);
    
    const [blogResults, productResults, docResults] = await Promise.all([
      this.searchBlog(query, detectedLang, Math.ceil(limit / 3)),
      this.searchProducts(query, detectedLang, Math.ceil(limit / 3)),
      this.searchDocumentation(query, detectedLang, Math.ceil(limit / 3))
    ]);

    const allResults = [...blogResults, ...productResults, ...docResults]
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);

    return {
      results: allResults,
      total: allResults.length,
      query,
      language: detectedLang
    };
  }
}

export const searchService = new SearchService();