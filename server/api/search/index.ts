import { Router } from 'express';
import { searchService } from '../../services/searchService';

const router = Router();

// Unified search across all content types
router.get('/', async (req, res) => {
  try {
    const { q: query, lang, limit = 30 } = req.query;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await searchService.searchAll(
      query,
      lang as 'en' | 'ru' | undefined,
      parseInt(limit as string)
    );
    
    res.json(results);
  } catch (error) {
    console.error('Unified search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;