# JSperplex

JSperplex is an innovative npm package for advanced semantic search and AI-powered answer generation. It provides powerful search capabilities that can be easily integrated into Node.js applications.

## Features

- Semantic searching using cutting-edge NLP techniques
- Intelligent result reranking for improved relevance
- AI-powered answer generation using Groq API
- Seamless integration with Node.js applications

## Installation

Install JSperplex via npm:

```bash
npm install jsperplex
```

## Usage

Here's a basic example of how to use JSperplex:

```javascript
import JSperplex from "jsperplex";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize JSperplex with your API keys
const searcher = new JSperplex({
  cohereApiKey: process.env.COHERE_API_KEY,
  jinaApiKey: process.env.JINA_API_KEY,
  serperApiKey: process.env.SERPER_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
});

// Configuration options for the search
const searchOptions = {
  proMode: true,
  location: "us",
};

// Perform a search
async function performSearch() {
  try {
    const result = await searcher.search(
      "What are the benefits of regular exercise?",
      searchOptions
    );
    console.log("Answer:", result.answer);
    console.log("Relevant Questions:", result.relevantQuestions);
    console.log("Number of sources:", result.sourcesResult.organic.length);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

performSearch();
```

## API Reference

### `new JSperplex(config)`

Creates a new JSperplex instance.

- `config`: An object containing API keys for various services.

### `search(query, options)`

Performs a semantic search and generates an AI-powered answer.

- `query`: The search query string.
- `options`: An object with the following properties:
  - `proMode`: Boolean indicating whether to use advanced features (default: false).
  - `location`: String representing the search location (default: 'us').

Returns a Promise that resolves to an object containing:

- `answer`: The generated answer string.
- `relevantQuestions`: An array of relevant follow-up questions.
- `sourcesResult`: An object containing the search results and sources.

## Environment Setup

Create a `.env` file in the root of your project and add your API keys:

```
COHERE_API_KEY=your_cohere_api_key
JINA_API_KEY=your_jina_api_key
SERPER_API_KEY=your_serper_api_key
GROQ_API_KEY=your_groq_api_key
```

You can obtain these keys from:

- Cohere: [https://cohere.ai/](https://cohere.ai/)
- Jina AI: [https://jina.ai/](https://jina.ai/)
- Serper: [https://serper.dev/](https://serper.dev/)
- Groq: [https://groq.com/](https://groq.com/)

## Contributing

We welcome contributions to JSperplex! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Support

For any questions or feedback, please open an issue on the [GitHub repository](https://github.com/saschaseniuk/jsperplex/issues).

---

Elevate your search capabilities with JSperplex! 🚀🔍
