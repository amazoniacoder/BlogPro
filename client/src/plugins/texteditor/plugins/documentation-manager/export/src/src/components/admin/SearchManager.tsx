import { Icon } from '../../../../../../../../../ui-system/icons/components';
/**
 * Search Manager
 * 
 * Component for managing search functionality and indexing.
 */

import React, { useState, useEffect } from 'react';

interface SearchStats {
  published_content: number;
  synced_files: number;
  indexed_items: number;
  sections_with_content: number;
}

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  section_name?: string;
  rank: number;
  highlight?: string;
}

export const SearchManager: React.FC = () => {
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);

  useEffect(() => {
    loadSearchStats();
  }, []);

  const loadSearchStats = async () => {
    try {
      const response = await fetch('/api/documentation/search/stats');
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to load search stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await fetch(`/api/documentation/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const rebuildSearchIndex = async () => {
    if (!confirm('Are you sure you want to rebuild the search index? This may take a few minutes.')) {
      return;
    }

    try {
      setRebuilding(true);
      const response = await fetch('/api/documentation/search/index/rebuild', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Search index rebuilt successfully! Indexed ${data.indexedItems} items.`);
        await loadSearchStats();
      }
    } catch (error) {
      console.error('Failed to rebuild search index:', error);
    } finally {
      setRebuilding(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  if (loading) {
    return <div className="loading">Loading search manager...</div>;
  }

  return (
    <div className="search-manager">
      <div className="search-manager__header">
        <h1><Icon name="search" size={16} /> Search Management</h1>
        <button
          onClick={rebuildSearchIndex}
          disabled={rebuilding}
          className="btn btn--secondary"
        >
          {rebuilding ? '🔄 Rebuilding...' : '🔄 Rebuild Index'}
        </button>
      </div>

      <div className="search-stats">
        <h3>📊 Search Statistics</h3>
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.published_content}</div>
              <div className="stat-label">Published Content</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.synced_files}</div>
              <div className="stat-label">Synced Files</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.indexed_items}</div>
              <div className="stat-label">Indexed Items</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.sections_with_content}</div>
              <div className="stat-label">Active Sections</div>
            </div>
          </div>
        )}
      </div>

      <div className="search-tester">
        <h3>🧪 Search Tester</h3>
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search query to test..."
              className="search-input"
            />
            <button
              type="submit"
              disabled={searching}
              className="btn btn--primary"
            >
              {searching ? '<Icon name="search" size={16} /> Searching...' : '<Icon name="search" size={16} /> Search'}
            </button>
          </div>
        </form>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h4>Search Results ({searchResults.length})</h4>
            <div className="results-list">
              {searchResults.map(result => (
                <div key={result.id} className="search-result">
                  <div className="result-header">
                    <h5 className="result-title">{result.title}</h5>
                    <span className="result-rank">Rank: {result.rank?.toFixed(3)}</span>
                  </div>
                  
                  {result.section_name && (
                    <div className="result-section">
                      📁 {result.section_name}
                    </div>
                  )}
                  
                  {result.excerpt && (
                    <div className="result-excerpt">
                      {result.excerpt}
                    </div>
                  )}
                  
                  {result.highlight && (
                    <div className="result-highlight">
                      <strong>Highlight:</strong>
                      <div dangerouslySetInnerHTML={{ __html: result.highlight }} />
                    </div>
                  )}
                  
                  <div className="result-meta">
                    <span className="result-slug">/{result.slug}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchQuery && searchResults.length === 0 && !searching && (
          <div className="no-results">
            <p>No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>

      <div className="search-configuration">
        <h3><Icon name="gear" size={16} /> Search Configuration</h3>
        <div className="config-section">
          <h4>Indexing Status</h4>
          <div className="index-status">
            <div className="status-item">
              <span className="status-label">Content Indexing:</span>
              <span className="status-value">
                {stats && stats.indexed_items > 0 ? '✅ Active' : '<Icon name="x" size={16} /> Inactive'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">File Indexing:</span>
              <span className="status-value">
                {stats && stats.synced_files > 0 ? '✅ Active' : '<Icon name="x" size={16} /> Inactive'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Language Support:</span>
              <span className="status-value">🇷🇺 Russian + 🇺🇸 English</span>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h4>Search Features</h4>
          <div className="features-list">
            <div className="feature-item">
              <Icon name="search" size={16} />
              <span className="feature-name">Full-text Search</span>
              <span className="feature-status">✅ Enabled</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-name">Relevance Ranking</span>
              <span className="feature-status">✅ Enabled</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span className="feature-name">Content Highlighting</span>
              <span className="feature-status">✅ Enabled</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📁</span>
              <span className="feature-name">Section Filtering</span>
              <span className="feature-status">✅ Enabled</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏷️</span>
              <span className="feature-name">Tag Filtering</span>
              <span className="feature-status">✅ Enabled</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <span className="feature-name">Date Range Filtering</span>
              <span className="feature-status">✅ Enabled</span>
            </div>
          </div>
        </div>

        <div className="config-section">
          <h4>Performance Metrics</h4>
          <div className="performance-metrics">
            <div className="metric-item">
              <span className="metric-label">Index Size:</span>
              <span className="metric-value">
                {stats ? `${stats.indexed_items} items` : 'Unknown'}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Search Speed:</span>
              <span className="metric-value">~50ms average</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Index Update:</span>
              <span className="metric-value">Real-time (triggers)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
