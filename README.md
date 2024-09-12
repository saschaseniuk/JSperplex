# JSperplex

JSperplex is an innovative, open-source JavaScript library for advanced semantic search and AI-powered answer generation. This project aims to provide powerful search capabilities that can be easily integrated into web applications.

## Features

- Semantic searching using cutting-edge NLP techniques
- Intelligent result reranking for improved relevance
- AI-powered answer generation
- Seamless integration with web applications

## Installation

You can install JSperplex via npm:

```bash
npm install jsperplex
```

Alternatively, you can clone the GitHub repository to include it in your project or contribute to its development:

```bash
git clone https://github.com/yourusername/jsperplex.git
```

## Usage

To use JSperplex, you'll need to obtain API keys for the various services it utilizes. Here's how to set it up:

```javascript
const JSperplex = require('jsperplex');

const searcher = new JSperplex({
  cohereApiKey: 'your-cohere-api-key',
  jinaApiKey: 'your-jina-api-key',
  serperApiKey: 'your-serper-api-key',
  groqApiKey: 'your-groq-api-key'
});

searcher.search('Your query here')
  .then(results => console.log(results))
  .catch(error => console.error(error));
```

Make sure to replace 'your-*-api-key' with your actual API keys. You can obtain these keys from:

- Cohere: [https://cohere.ai/](https://cohere.ai/)
- Jina AI: [https://jina.ai/](https://jina.ai/)
- Serper: [https://serper.dev/](https://serper.dev/)
- Groq: [https://groq.com/](https://groq.com/)

## Contributing

We welcome contributions to JSperplex! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- All contributors who participate in this project

## Contact

For any questions or feedback, please open an issue on this repository.

---

Elevate your search capabilities with JSperplex! 🚀🔍
