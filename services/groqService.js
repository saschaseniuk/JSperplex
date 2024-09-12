import { Groq } from 'groq-sdk';
import { PromptTemplate } from '@langchain/core/prompts';
import { groqApiKey } from '../config/environment.js';
import logger from '../utils/logger.js';
import { searchPromptSystem, relevantPromptSystem } from '../config/prompts.js';

const MODEL = 'llama3-70b-8192';
const client = new Groq(groqApiKey);

async function getAnswer(query, contexts, dateContext, location) {
  logger.info('Generating answer', { 
    queryLength: query.length, 
    contextsLength: contexts.length, 
    dateContext, 
    location 
  });

  const systemPromptSearch = PromptTemplate.fromTemplate(searchPromptSystem);

  const messages = [
    { role: "system", content: await systemPromptSearch.format({ date_today: dateContext, location: location }) },
    { role: "user", content: `User Question : ${query}\n\n CONTEXTS :\n\n${contexts}` }
  ];

  try {
    logger.info('Sending request to Groq API for answer generation', { 
      model: MODEL,
      messagesCount: messages.length
    });

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: messages,
      stream: false,
      stop: null,
    });

    logger.info('Received response from Groq API', {
      choicesCount: response.choices?.length
    });

    if (response.choices && response.choices[0] && response.choices[0].message) {
      const answer = response.choices[0].message.content;
      logger.info('Answer generation completed', { answerLength: answer.length });
      return answer;
    } else {
      throw new Error('Unexpected response format from Groq API');
    }
  } catch (error) {
    logger.error('Error during get_answer_groq call', { 
      error: error.message,
      stack: error.stack
    });
    return JSON.stringify({
      type: 'error',
      data: "We are currently experiencing some issues. Please try again later."
    });
  }
}

async function getRelevantQuestions(contexts, query, location) {
  logger.info('Generating relevant questions', { 
    contextsLength: contexts.length, 
    queryLength: query.length, 
    location 
  });

  try {
    const safeLocation = typeof location === 'string' ? location : 'en';
    const sanitizedPrompt = relevantPromptSystem.replace(/\{\{location\}\}/g, safeLocation);

    const messages = [
      { role: "system", content: sanitizedPrompt },
      { role: "user", content: `User Query: ${query}\n\nContexts: ${contexts}\n` }
    ];

    logger.info('Sending request to Groq API for relevant questions', { 
      model: MODEL,
      messagesCount: messages.length
    });
    
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: messages,
      response_format: { type: "json_object" },
    });

    logger.info('Received response from Groq API for relevant questions', {
      choicesCount: response.choices?.length
    });

    const content = response.choices[0].message.content;

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      logger.error('Error parsing JSON response', { 
        error: parseError.message,
        contentLength: content.length
      });
      throw new Error('Invalid JSON response from Groq API');
    }

    if (!parsedContent.followUp || !Array.isArray(parsedContent.followUp) || parsedContent.followUp.length === 0) {
      logger.error('Invalid or empty response format from Groq API', { 
        parsedContentKeys: Object.keys(parsedContent)
      });
      throw new Error('Invalid response format from Groq API');
    }

    const followUpQuestions = parsedContent.followUp.slice(0, 3);
    while (followUpQuestions.length < 3) {
      followUpQuestions.push(`Additional question about ${query}`);
    }

    logger.info('Successfully generated relevant questions', { 
      questionsCount: followUpQuestions.length 
    });

    return { followUp: followUpQuestions };
  } catch (error) {
    logger.error('Error during RELEVANT GROQ call', { 
      error: error.message,
      stack: error.stack
    });
    return {
      followUp: [
        "Unable to generate follow-up questions at this time.",
        "Please try again later or rephrase your query.",
        "If the problem persists, contact support."
      ]
    };
  }
}

export { getAnswer, getRelevantQuestions };