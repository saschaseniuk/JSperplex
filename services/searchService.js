import axios from 'axios';
import { serperApiKey } from '../config/environment.js';
import logger from '../utils/logger.js';

const API_URL = 'https://google.serper.dev/search';
const DEFAULT_LOCATION = 'us';

async function getSources(query, proMode = false, storedLocation = null) {
  logger.info('Starting search process', { 
    queryLength: query.length, 
    proMode, 
    storedLocation 
  });

  try {
    const searchLocation = (storedLocation || DEFAULT_LOCATION).toLowerCase();
    const numResults = proMode ? 10 : 20;

    const payload = {
      q: query,
      num: numResults,
      gl: searchLocation
    };

    logger.info('Sending request to Serper API', { 
      queryLength: query.length, 
      numResults, 
      searchLocation 
    });

    const response = await axios.post(API_URL, payload, {
      headers: {
        'X-API-KEY': serperApiKey,
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;
    logger.info('Received response from Serper API', { 
      statusCode: response.status,
      organicResultsCount: data.organic?.length,
      topStoriesCount: data.topStories?.length,
      imagesCount: data.images?.length,
      hasKnowledgeGraph: !!data.knowledgeGraph,
      hasAnswerBox: !!data.answerBox
    });

    const result = {
      organic: extractFields(data.organic || [], ['title', 'link', 'snippet', 'date']),
      topStories: extractFields(data.topStories || [], ['title', 'imageUrl']),
      images: extractFields((data.images || []).slice(0, 6), ['title', 'imageUrl']),
      graph: data.knowledgeGraph,
      answerBox: data.answerBox
    };

    logger.info('Search process completed', { 
      organicResultsCount: result.organic.length,
      topStoriesCount: result.topStories.length,
      imagesCount: result.images.length,
      hasGraph: !!result.graph,
      hasAnswerBox: !!result.answerBox
    });
    
    return result;
  } catch (error) {
    logger.error('Error while getting sources', { 
      error: error.message,
      stack: error.stack
    });
    return { error: 'Failed to fetch search results' };
  }
}

function extractFields(items, fields) {
  return items.map(item => 
    fields.reduce((acc, field) => {
      if (item.hasOwnProperty(field)) {
        acc[field] = item[field];
      }
      return acc;
    }, {})
  );
}

export { getSources };