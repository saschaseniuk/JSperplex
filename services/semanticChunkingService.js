import axios from 'axios';
import { cohereApiKey } from '../config/environment.js';
import logger from '../utils/logger.js';

const COHERE_API_URL = 'https://api.cohere.ai/v1/embed';

async function getEmbeddings(text) {
  logger.info('Getting embeddings', { textLength: text.length });
  try {
    const payload = {
      texts: [text],
      model: 'embed-multilingual-v3.0',
      input_type: 'search_document'
    };
    
    logger.info('Sending request to Cohere API for embeddings', {
      model: payload.model,
      inputType: payload.input_type
    });

    const response = await axios.post(COHERE_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${cohereApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    logger.info('Received response from Cohere API', {
      statusCode: response.status,
      embeddingsLength: response.data.embeddings[0].length
    });

    return response.data.embeddings[0];
  } catch (error) {
    logger.error('Error getting embeddings', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

async function getChunking(text, maxSplitTokens = 200) {
  logger.info('Starting chunking process', { 
    textLength: text.length, 
    maxSplitTokens 
  });

  if (!text || typeof text !== 'string') {
    logger.error('Invalid input: text must be a non-empty string');
    return [];
  }

  try {
    const words = text.split(/\s+/);
    const chunks = [];
    let currentChunk = [];

    for (const word of words) {
      currentChunk.push(word);
      if (currentChunk.length >= maxSplitTokens) {
        chunks.push(currentChunk.join(' '));
        currentChunk = [];
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    logger.info('Chunking completed', { 
      chunksCount: chunks.length,
      averageChunkLength: chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length
    });

    return chunks;
  } catch (error) {
    logger.error('Error during chunking process', {
      error: error.message,
      stack: error.stack
    });
    return [];
  }
}

export { getChunking, getEmbeddings };