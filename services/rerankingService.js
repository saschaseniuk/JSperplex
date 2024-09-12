import axios from 'axios';
import { jinaApiKey } from '../config/environment.js';
import logger from '../utils/logger.js';

const API_URL = 'https://api.jina.ai/v1/rerank';
const MODEL = 'jina-reranker-v2-base-multilingual';

async function getRerankingJina(docs, query, topRes) {
  logger.info('Starting reranking process', { 
    docsCount: docs.length, 
    queryLength: query.length, 
    topRes 
  });

  try {
    const data = {
      model: MODEL,
      query: query,
      documents: docs,
      top_n: topRes
    };

    logger.info('Sending request to Jina AI API for reranking', { 
      model: MODEL, 
      docsCount: docs.length,
      queryLength: query.length, 
      topN: topRes 
    });

    const response = await axios.post(API_URL, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jinaApiKey}`
      }
    });

    logger.info('Received response from Jina AI API', { 
      statusCode: response.status,
      resultsCount: response.data.results?.length 
    });

    const results = response.data.results.map(item => item.document.text);
    
    logger.info('Reranking completed', { 
      rerankedResultsCount: results.length 
    });

    return results;
  } catch (error) {
    logger.error('Error occurred while reranking', { 
      error: error.message,
      stack: error.stack 
    });
    return [];
  }
}

export { getRerankingJina };