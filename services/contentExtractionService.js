import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio';
import logger from '../utils/logger.js';

async function extractWebsiteContent(url) {
  logger.info('Extracting content from URL', { url });
  try {
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();
    logger.debug('Loaded documents from URL', { 
      url, 
      docsCount: docs.length 
    });

    let cleanText = docs.map(doc => doc.pageContent.replace(/\n/g, ' ')).join(' ');
    logger.debug('Cleaned text', { cleanTextLength: cleanText.length });

    const result = cleanText.length > 200 ? cleanText.slice(0, 4000) : cleanText;
    logger.info('Content extraction completed', { 
      url, 
      resultLength: result.length 
    });
    return result;
  } catch (error) {
    logger.error('Error extracting content from URL', { 
      url, 
      error: error.message,
      stack: error.stack
    });
    return "";
  }
}

export { extractWebsiteContent };