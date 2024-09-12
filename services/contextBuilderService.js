import { getRerankingJina } from './rerankingService.js';
import { getChunking } from './semanticChunkingService.js';
import logger from '../utils/logger.js';

async function buildContext(sourcesResult, query, proMode, dateContext, location) {
  logger.info('Building context', { 
    queryLength: query.length, 
    proMode, 
    dateContext, 
    location 
  });

  try {
    const combinedList = [];

    const organicResults = sourcesResult.organic || [];
    const graph = sourcesResult.graph;
    const answerBox = sourcesResult.answerBox;

    // Extract snippets from organic results
    const snippets = organicResults
      .filter(item => item.snippet)
      .map(item => `${item.snippet} ${item.date || ''}`);
    combinedList.push(...snippets);
    logger.debug('Added snippets to context', { snippetsCount: snippets.length });

    // Process HTML content
    const htmlText = organicResults
      .filter(item => item.html)
      .map(item => item.html)
      .join(' ');
    
    if (htmlText.length > 200) {
      const chunks = await getChunking(htmlText);
      combinedList.push(...chunks);
      logger.debug('Added HTML chunks to context', { chunksCount: chunks.length });
    }

    // Extract top stories titles
    if (sourcesResult.topStories) {
      const topStoriesTitles = sourcesResult.topStories
        .filter(item => item.title)
        .map(item => item.title);
      combinedList.push(...topStoriesTitles);
      logger.debug('Added top stories titles to context', { topStoriesCount: topStoriesTitles.length });
    }

    // Add descriptions and answers from 'graph' and 'answerBox'
    if (graph && graph.description) {
      combinedList.push(graph.description);
      logger.debug('Added knowledge graph description to context');
    }

    if (answerBox) {
      ['answer', 'snippet'].forEach(key => {
        if (answerBox[key]) {
          combinedList.push(answerBox[key]);
          logger.debug(`Added answerBox ${key} to context`);
        }
      });
    }

    let finalList;
    if (proMode) {
      logger.info('Applying reranking in pro mode');
      finalList = await getRerankingJina(combinedList, query + dateContext, 15, location);
      logger.debug('Reranked context', { rerankedCount: finalList.length });
    } else {
      finalList = combinedList;
    }

    const result = finalList.join('\n\n');
    logger.info('Context building completed', { contextLength: result.length });
    return result;
  } catch (error) {
    logger.error('Error occurred while building context', { 
      error: error.message,
      stack: error.stack
    });
    return '';
  }
}

export { buildContext };