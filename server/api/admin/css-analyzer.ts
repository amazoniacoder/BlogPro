import { Router } from 'express';
import { CSSAnalyzerService } from '../../services/cssAnalyzerService';
import path from 'path';

const router = Router();
let cssAnalyzer: CSSAnalyzerService | null = null;

const getCSSAnalyzer = () => {
  if (!cssAnalyzer) {
    cssAnalyzer = new CSSAnalyzerService();
  }
  return cssAnalyzer;
};

// Scan and analyze CSS files
router.get('/analyze', async (_, res) => {
  try {
    const analyzer = getCSSAnalyzer();
    const cssRoot = path.join(process.cwd(), 'client/src/ui-system');
    await analyzer.scanCSSFiles(cssRoot);
    const duplicates = analyzer.findDuplicates();
    
    res.json({
      success: true,
      data: {
        totalFiles: analyzer['cssFiles'].length,
        totalRules: analyzer['rules'].length,
        duplicateGroups: duplicates,
        summary: {
          identicalDuplicates: duplicates.filter(d => d.duplicateType === 'identical').length,
          similarDuplicates: duplicates.filter(d => d.duplicateType === 'similar').length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to analyze CSS files',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Validate CSS files against W3C standards
router.get('/validate', async (_, res) => {
  try {
    const analyzer = getCSSAnalyzer();
    const cssRoot = path.join(process.cwd(), 'client/src/ui-system');
    await analyzer.scanCSSFiles(cssRoot);
    const validation = analyzer.validateW3C();
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to validate CSS files',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Reset analyzer state
router.post('/reset', async (_, res) => {
  try {
    if (cssAnalyzer) {
      cssAnalyzer.clearCache();
    }
    cssAnalyzer = null; // Clear singleton instance
    res.json({
      success: true,
      message: 'Analyzer state reset successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reset analyzer',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Remove duplicate CSS rule
router.delete('/duplicate', async (req, res) => {
  try {
    const { filePath, selector } = req.body;
    
    if (!filePath || !selector) {
      return res.status(400).json({
        success: false,
        message: 'File path and selector are required'
      });
    }
    
    const analyzer = getCSSAnalyzer();
    await analyzer.removeDuplicate(filePath, selector);
    
    console.log(`Removed duplicate: ${selector} from ${filePath}`);
    
    res.json({
      success: true,
      message: 'Duplicate removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove duplicate',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;