import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PartitionLRUCache } from './PartitionLRUCache.js';
import { MemoryMonitor } from './MemoryMonitor.js';
import { IntelligentPreloader } from './IntelligentPreloader.js';
import { AdaptiveMemoryManager } from './AdaptiveMemoryManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// LRU Cache for partitioned dictionaries
const partitionCache = new PartitionLRUCache(8); // Max 8 partitions (~300K words)
const fallbackWords = new Set<string>();

// Memory monitor for automatic cleanup
const memoryMonitor = new MemoryMonitor(partitionCache);

// Intelligent preloader for predictive loading
const intelligentPreloader = new IntelligentPreloader(partitionCache, loadPartitionFromFile);

// Adaptive memory manager for self-optimization (Stage 4)
const adaptiveManager = new AdaptiveMemoryManager(partitionCache, memoryMonitor, intelligentPreloader);

// Letters that cannot start Russian words (grammatical markers only)
const NON_INITIAL_LETTERS = new Set(['ь', 'ъ', 'ы']);

// Load partition from file (used by both direct loading and preloader)
async function loadPartitionFromFile(letter: string): Promise<Set<string>> {
  // Skip letters that cannot start Russian words
  if (NON_INITIAL_LETTERS.has(letter.toLowerCase())) {
    console.log(`📝 Skipping partition '${letter}' - Russian words cannot start with this letter`);
    return new Set();
  }
  
  const partitionPath = path.join(__dirname, `../../client/src/plugins/texteditor/dictionaries/prefixes/rare/ru_${letter}.txt`);
  
  if (!fs.existsSync(partitionPath)) {
    throw new Error(`Partition file not found: ru_${letter}.txt`);
  }
  
  const content = fs.readFileSync(partitionPath, 'utf8');
  const words = new Set<string>();
  
  content.split('\n').forEach(word => {
    const cleanWord = word.trim().toLowerCase();
    if (cleanWord.length > 0) {
      words.add(cleanWord);
    }
  });
  
  console.log(`📚 Loaded partition '${letter}': ${words.size} words`);
  return words;
}

// Load specific partition on demand with LRU caching (synchronous)
function loadPartition(letter: string): Set<string> {
  // Check cache first
  const cachedPartition = partitionCache.get(letter);
  if (cachedPartition) {
    return cachedPartition;
  }

  // Skip letters that cannot start Russian words
  if (NON_INITIAL_LETTERS.has(letter.toLowerCase())) {
    console.log(`📝 Skipping partition '${letter}' - Russian words cannot start with this letter`);
    return new Set();
  }

  // Load from file synchronously for immediate use
  try {
    const partitionPath = path.join(__dirname, `../../client/src/plugins/texteditor/dictionaries/prefixes/rare/ru_${letter}.txt`);
    
    if (!fs.existsSync(partitionPath)) {
      console.error(`Partition file not found: ru_${letter}.txt`);
      return new Set();
    }
    
    const content = fs.readFileSync(partitionPath, 'utf8');
    const words = new Set<string>();
    
    content.split('\n').forEach(word => {
      const cleanWord = word.trim().toLowerCase();
      if (cleanWord.length > 0) {
        words.add(cleanWord);
      }
    });
    
    // Store in LRU cache
    partitionCache.set(letter, words);
    console.log(`📚 Loaded partition '${letter}': ${words.size} words`);
    return words;
  } catch (error) {
    console.error(`Failed to load partition '${letter}':`, error);
    return new Set();
  }
}

// Initialize with essential words fallback
function initializeFallback() {
  const essentialWords = ['программа', 'привет', 'компьютер', 'интернет', 'система', 'данные', 'абажур', 'абзац', 'автобус'];
  essentialWords.forEach(word => fallbackWords.add(word));
  console.log('🔄 Initialized fallback dictionary with essential words');
}

// Initialize fallback dictionary
initializeFallback();

// Start memory monitoring
memoryMonitor.startMonitoring();
console.log('🔍 Memory monitoring started');

// Check if word is correct using partitioned approach
function isWordCorrect(word: string, language: string = 'ru'): boolean {
  const normalizedWord = word.toLowerCase().trim();
  
  console.log(`🔍 SERVER DEBUG: Checking word "${word}" -> normalized: "${normalizedWord}" in language: ${language}`);
  
  if (language === 'ru' && normalizedWord.length > 0) {
    const firstLetter = normalizedWord[0];
    
    // Load partition for this letter
    const partition = loadPartition(firstLetter);
    const result = partition.has(normalizedWord);
    
    // Fallback to essential words if partition not found
    const fallbackResult = !result ? fallbackWords.has(normalizedWord) : false;
    
    console.log(`🔍 SERVER DEBUG: "${normalizedWord}" [${firstLetter}] - Partition: ${result}, Fallback: ${fallbackResult}, Final: ${result || fallbackResult}`);
    console.log(`📊 SERVER DEBUG: Partition '${firstLetter}' size: ${partition.size}, Cache stats: ${JSON.stringify(partitionCache.getStats())}`);
    
    return result || fallbackResult;
  }
  
  return false;
}

// Legacy endpoint for backward compatibility
router.post('/', async (req: express.Request, res: express.Response) => {
  try {
    const { word, language = 'ru' } = req.body;
    
    if (!word) {
      return res.status(400).json({ error: 'Word is required' });
    }

    const isCorrect = isWordCorrect(word, language);
    res.json({ isCorrect });
  } catch (error) {
    console.error('Legacy spell check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Spell check endpoint with intelligent preloading
router.post('/check', async (req: express.Request, res: express.Response) => {
  try {
    const { words, language = 'ru', text } = req.body;
    
    if (!Array.isArray(words)) {
      return res.status(400).json({ error: 'Words must be an array' });
    }

    // Trigger intelligent preloading if full text is provided
    if (text && typeof text === 'string' && text.length > 20) {
      intelligentPreloader.analyzeAndPreload(text).catch(error => {
        console.warn('Preloading failed:', error);
      });
      
      // Update adaptive manager with usage data
      adaptiveManager.updateUsageData(text.length, language, words);
    }

    const results = words.map(word => ({
      word,
      correct: isWordCorrect(word, language)
    }));

    res.json({
      results,
      language,
      dictionarySize: language === 'ru' ? partitionCache.getTotalWords() + fallbackWords.size : 0
    });
  } catch (error) {
    console.error('Spell check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cache management endpoint
router.post('/cache/clear', (_req: express.Request, res: express.Response) => {
  const beforeStats = partitionCache.getStats();
  partitionCache.clear();
  const afterStats = partitionCache.getStats();
  
  res.json({
    message: 'Cache cleared successfully',
    before: beforeStats,
    after: afterStats
  });
});

// Cache resize endpoint
router.post('/cache/resize', (req: express.Request, res: express.Response) => {
  const { size } = req.body;
  
  if (!size || size < 1 || size > 20) {
    return res.status(400).json({ error: 'Size must be between 1 and 20' });
  }
  
  const oldSize = partitionCache.getStats().maxSize;
  partitionCache.setMaxSize(size);
  const newStats = partitionCache.getStats();
  
  res.json({
    message: `Cache resized from ${oldSize} to ${size}`,
    stats: newStats
  });
});

// Memory monitoring endpoints
router.get('/memory/status', (_req: express.Request, res: express.Response) => {
  const status = memoryMonitor.getStatus();
  res.json(status);
});

router.post('/memory/check', (_req: express.Request, res: express.Response) => {
  memoryMonitor.forceCheck();
  const status = memoryMonitor.getStatus();
  res.json({
    message: 'Memory check completed',
    status
  });
});

router.post('/memory/thresholds', (req: express.Request, res: express.Response) => {
  const { warning, cleanup, critical } = req.body;
  
  const thresholds: any = {};
  if (warning) thresholds.warning = warning * 1024 * 1024; // Convert MB to bytes
  if (cleanup) thresholds.cleanup = cleanup * 1024 * 1024;
  if (critical) thresholds.critical = critical * 1024 * 1024;
  
  memoryMonitor.updateThresholds(thresholds);
  
  res.json({
    message: 'Memory thresholds updated',
    status: memoryMonitor.getStatus()
  });
});

// Preloader management endpoints
router.get('/preloader/stats', (_req: express.Request, res: express.Response) => {
  const stats = intelligentPreloader.getPreloadingStats();
  res.json(stats);
});

router.post('/preloader/optimize', (_req: express.Request, res: express.Response) => {
  intelligentPreloader.optimizeCache();
  res.json({
    message: 'Cache optimization triggered',
    stats: intelligentPreloader.getPreloadingStats()
  });
});

router.post('/preloader/analyze', (req: express.Request, res: express.Response) => {
  const { text } = req.body;
  
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  intelligentPreloader.analyzeAndPreload(text).then(() => {
    res.json({
      message: 'Text analysis and preloading completed',
      stats: intelligentPreloader.getPreloadingStats()
    });
  }).catch(error => {
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  });
});

// Dictionary file serving endpoints
router.get('/dictionaries/:type/:category/:filename', (req: express.Request, res: express.Response) => {
  const { type, category, filename } = req.params;
  
  // Validate parameters
  if (!['prefixes', 'partitions'].includes(type)) {
    return res.status(400).json({ error: 'Invalid dictionary type' });
  }
  
  if (type === 'prefixes' && !['common', 'rare'].includes(category)) {
    return res.status(400).json({ error: 'Invalid prefix category' });
  }
  
  if (!filename.match(/^ru_[а-я]{1,2}\.txt$/)) {
    return res.status(400).json({ error: 'Invalid filename format' });
  }

  const filePath = path.join(__dirname, '../../client/src/plugins/texteditor/dictionaries', type, category, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Dictionary file not found' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read dictionary file' });
  }
});

router.get('/dictionaries/:type/:filename', (req: express.Request, res: express.Response) => {
  const { type, filename } = req.params;
  
  if (type !== 'partitions') {
    return res.status(400).json({ error: 'Invalid dictionary type' });
  }
  
  if (!filename.match(/^ru_[а-я]\.txt$/)) {
    return res.status(400).json({ error: 'Invalid filename format' });
  }

  const filePath = path.join(__dirname, '../../client/src/plugins/texteditor/dictionaries', type, filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Dictionary file not found' });
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(content);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read dictionary file' });
  }
});



// Stage 4: Advanced Analytics and Adaptive Thresholds endpoints
router.get('/analytics/health', (_req: express.Request, res: express.Response) => {
  const health = adaptiveManager.getSystemHealth();
  res.json(health);
});

router.get('/analytics/stats', (_req: express.Request, res: express.Response) => {
  const stats = adaptiveManager.getOptimizationStats();
  res.json(stats);
});

router.post('/analytics/optimize', async (_req: express.Request, res: express.Response) => {
  try {
    const result = await adaptiveManager.forceOptimization();
    res.json({
      message: 'System optimization completed',
      result
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Optimization failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/analytics/usage', (req: express.Request, res: express.Response) => {
  const { textLength, language, words } = req.body;
  
  if (!textLength || !language || !Array.isArray(words)) {
    return res.status(400).json({ error: 'Missing required fields: textLength, language, words' });
  }
  
  adaptiveManager.updateUsageData(textLength, language, words);
  res.json({ message: 'Usage data updated successfully' });
});

// Health check endpoint for debugging
router.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: ['/', '/check', '/stats', '/cache/clear'],
    dictionaryStatus: partitionCache.getStats()
  });
});

// Get dictionary stats (legacy endpoint for old partition system)
router.get('/stats', (_req: express.Request, res: express.Response) => {
  const cacheStats = partitionCache.getStats();
  const memoryStatus = memoryMonitor.getStatus();
  
  res.json({
    russian: {
      cache: {
        size: cacheStats.size,
        maxSize: cacheStats.maxSize,
        hitRate: Math.round(cacheStats.hitRate * 100) / 100,
        totalRequests: cacheStats.totalRequests,
        totalHits: cacheStats.totalHits,
        memoryUsageMB: Math.round(partitionCache.getMemoryUsageMB() * 100) / 100
      },
      partitions: {
        loaded: partitionCache.getCachedPartitions(),
        totalWords: partitionCache.getTotalWords(),
        fallbackWords: fallbackWords.size
      },
      memory: {
        isMonitoring: memoryStatus.isMonitoring,
        currentUsageMB: Math.round(memoryStatus.currentMemory.heapUsed / 1024 / 1024),
        usagePercent: Math.round(memoryStatus.currentMemory.usagePercent),
        thresholds: {
          warningMB: Math.round(memoryStatus.thresholds.warning / 1024 / 1024),
          cleanupMB: Math.round(memoryStatus.thresholds.cleanup / 1024 / 1024),
          criticalMB: Math.round(memoryStatus.thresholds.critical / 1024 / 1024)
        }
      }
    }
  });
});

// Get hybrid dictionary stats (new endpoint for client-side hybrid system)
router.get('/hybrid-stats', (_req: express.Request, res: express.Response) => {
  // This endpoint returns a placeholder since the actual hybrid stats 
  // are managed client-side by HybridDictionaryLoader
  res.json({
    message: 'Hybrid dictionary stats are managed client-side',
    serverStats: {
      dictionaryFilesServed: 'Available via /dictionaries endpoints',
      cacheDisabled: true,
      filesLocation: 'client/src/plugins/texteditor/dictionaries/prefixes/rare/'
    }
  });
});

// Phase 1.1: Word-level validation endpoint
router.post('/word', async (req: express.Request, res: express.Response) => {
  const { word, language = 'ru' } = req.body;
  
  if (!word || typeof word !== 'string') {
    return res.status(400).json({ error: 'Word is required' });
  }
  
  try {
    const isValid = await validateSingleWord(word, language);
    res.json({ word, isValid, language });
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

async function validateSingleWord(word: string, language: string): Promise<boolean> {
  const prefix = word.substring(0, 2);
  const dictionary = await loadDictionaryForPrefix(prefix, language);
  return dictionary.has(word.toLowerCase());
}

async function loadDictionaryForPrefix(prefix: string, language: string): Promise<Set<string>> {
  const filePath = path.join(__dirname, `../../client/src/plugins/texteditor/dictionaries/prefixes/rare/${language}_${prefix}.txt`);
  
  console.log(`🔍 SERVER: Looking for dictionary at: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ SERVER: Dictionary file not found: ${filePath}`);
    return new Set<string>();
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const words = content.split('\n')
      .filter(word => word.trim() && !word.startsWith('#'))
      .map(word => word.toLowerCase().trim());
    
    console.log(`✅ SERVER: Loaded ${words.length} words from ${filePath}`);
    return new Set(words);
  } catch (error) {
    console.error(`❌ SERVER: Error reading dictionary file:`, error);
    return new Set<string>();
  }
}

// Phase 2.1: Batch validation endpoint
router.post('/batch', async (req: express.Request, res: express.Response) => {
  const { words, language = 'ru' } = req.body;
  
  if (!Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ error: 'Words array is required' });
  }
  
  if (words.length > 100) {
    return res.status(400).json({ error: 'Maximum 100 words per batch' });
  }
  
  try {
    const results = await validateWordsBatch(words, language);
    res.json({ results, language });
  } catch (error) {
    console.error('Batch validation failed:', error);
    // Fallback: return all words as valid to prevent editor errors
    const fallbackResults = words.map(() => true);
    res.json({ results: fallbackResults, language, fallback: true });
  }
});

async function validateWordsBatch(words: string[], language: string): Promise<boolean[]> {
  console.log(`🔍 SERVER BATCH: Validating ${words.length} words:`, words);
  
  try {
    // Group words by prefix for efficient dictionary loading
    const prefixGroups = new Map<string, string[]>();
    
    words.forEach(word => {
      const prefix = word.substring(0, 2);
      if (!prefixGroups.has(prefix)) {
        prefixGroups.set(prefix, []);
      }
      prefixGroups.get(prefix)!.push(word);
    });
    
    console.log(`🔍 SERVER BATCH: Grouped into ${prefixGroups.size} prefixes:`, Array.from(prefixGroups.keys()));
    
    const results: boolean[] = new Array(words.length);
    
    // Process each prefix group
    for (const [prefix, prefixWords] of prefixGroups) {
      try {
        const dictionary = await loadDictionaryForPrefix(prefix, language);
        console.log(`🔍 SERVER BATCH: Loaded ${dictionary.size} words for prefix '${prefix}'`);
        
        prefixWords.forEach(word => {
          const index = words.indexOf(word);
          results[index] = dictionary.has(word.toLowerCase());
        });
      } catch (error) {
        console.warn(`🔍 SERVER BATCH: Failed to load dictionary for prefix '${prefix}', marking words as valid`);
        // Mark all words in this prefix group as valid if dictionary loading fails
        prefixWords.forEach(word => {
          const index = words.indexOf(word);
          results[index] = true;
        });
      }
    }
    
    console.log(`🔍 SERVER BATCH: Results:`, results);
    return results;
  } catch (error) {
    console.error('🔍 SERVER BATCH: Critical error in batch validation:', error);
    // Return all words as valid if there's a critical error
    return words.map(() => true);
  }
}

export default router;