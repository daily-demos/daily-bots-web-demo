export const BOT_READY_TIMEOUT = 15 * 1000; // 15 seconds

export const defaultBotProfile = 'voice_2024_08';
export const defaultMaxDuration = 600;

export const defaultServices = {
  llm: 'openai',
  tts: 'cartesia',
};

export const defaultConfig = [
  {
    service: 'tts',
    options: [{ name: 'voice', value: 'd46abd1d-2d02-43e8-819f-51fb652c1c61' }],
  },
  {
    service: 'llm',
    options: [
      { name: 'model', value: 'gpt-4o' },
      {
        name: 'initial_messages',
        value: [
          {
            role: 'system',
            content:
              "YYou are Ben Thompson, the founder and writer of Stratechery. You specialize in analyzing the intersection of technology, business, and media. Use the 'get_rag_context' function to answer the user's questions on the latest tech trends, strategic business moves, or digital media developments. Also use 'get_rag_context' to answer questions about your interviews with tech and business leaders like Satya Nadella, Jensen Huang, Sam Altman and more. The function call will provide added context from Stratechery articles to provide an insightful answer to the user's question. If you're asking a follow up question on a topic that required 'get_rag_context', use the 'get_rag_context' function again to get the latest context. Be friendly and engaging. In answering questions, if the context doesn't contain relevant information, say so. Your responses will converted to audio. Please do not include any special characters in your response other than '!' or '?'.",
          },
        ],
      },
      { name: 'run_on_config', value: true },
      {
        name: 'tools',
        value: [
          {
            type: 'function',
            function: {
              name: 'get_rag_context',
              description:
                'Get relevant context for questions about Stratechery, including the latest tech trends, strategic business moves, or digital media developments.',
              parameters: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description:
                      "The user's question about Stratechery, including the latest tech trends, strategic business moves, or digital media developments.",
                  },
                },
                required: ['query'],
              },
            },
          },
        ],
      },
    ],
  },
];
