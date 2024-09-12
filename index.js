import { getSources } from './services/searchService.js';
import { buildContext } from './services/contextBuilderService.js';
import { getAnswer, getRelevantQuestions } from './services/groqService.js';
import { extractWebsiteContent } from './services/contentExtractionService.js';
import logger from './utils/logger.js';

class JSperplex {
  #logStep(step, data) {
    logger.step(step, data);
  }

  constructor(config) {
    this.config = config;
  }

  async search(query, options = {}) {
    const {
      proMode = false,
      location = 'us',
      dateContext = new Date().toISOString()
    } = options;

    logger.info('Starting search', { 
      queryLength: query.length, 
      proMode, 
      location, 
      dateContext 
    });

    try {
      // Step 1: Get search results
      this.#logStep(1, { query, proMode, location });
      const sourcesResult = await getSources(query, proMode, location);
      this.#logStep('1 Result', { sourcesResultLength: sourcesResult?.organic?.length });

      // Step 2: Extract content from websites if in pro mode
      if (proMode && sourcesResult && sourcesResult.organic) {
        this.#logStep(2, { proMode, organicResultsCount: sourcesResult.organic.length });
        const websitesToScrape = 2; // You can adjust this number
        for (let i = 0; i < Math.min(websitesToScrape, sourcesResult.organic.length); i++) {
          const source = sourcesResult.organic[i];
          if (source && source.link) {
            this.#logStep(`2.${i+1}`, { scraping: source.link });
            source.html = await extractWebsiteContent(source.link);
            this.#logStep(`2.${i+1} Result`, { htmlLength: source.html?.length });
          }
        }
      }

      // Step 3: Build context
      this.#logStep(3, { buildingContext: true });
      const context = await buildContext(sourcesResult, query, proMode, dateContext, location);
      this.#logStep('3 Result', { contextLength: context?.length });

      // Step 4: Generate answer
      this.#logStep(4, { generatingAnswer: true });
      let fullAnswer;
      try {
        fullAnswer = await getAnswer(query, context, dateContext, location);
        if (typeof fullAnswer === 'string') {
          logger.debug('Received answer', { answerLength: fullAnswer.length });
        } else if (fullAnswer.type === 'error') {
          throw new Error(fullAnswer.data);
        }
      } catch (error) {
        logger.error(`Error generating answer: ${error.message}`);
        fullAnswer = "We apologize, but we couldn't generate an answer at this time. Please try again later.";
      }
      this.#logStep('4 Result', { answerLength: fullAnswer.length });

      // Step 5: Generate relevant questions
      this.#logStep(5, { generatingRelevantQuestions: true });
      let relevantQuestions;
      try {
        relevantQuestions = await getRelevantQuestions(context, query, location);
        this.#logStep('5 Result', { relevantQuestionsCount: relevantQuestions.followUp?.length });
      } catch (error) {
        logger.error(`Error generating relevant questions: ${error.message}`);
        relevantQuestions = { 
          followUp: [
            "What are some related topics to explore?",
            "Can you provide more details on this subject?",
            "Are there any recent developments in this area?"
          ]
        };
      }

      const result = {
        answer: fullAnswer,
        relevantQuestions: relevantQuestions.followUp || [],
        sourcesResult
      };
      this.#logStep('Final Result', { 
        answerLength: result.answer?.length,
        relevantQuestionsCount: result.relevantQuestions?.length,
        sourcesResultCount: result.sourcesResult?.organic?.length
      });
      logger.info('Search completed successfully');
      return result;
    } catch (error) {
      logger.error(`Error in JSperplex search: ${error.message}`, { stack: error.stack });
      throw error;
    }
  }
}

export default JSperplex;