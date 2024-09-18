export const BOT_READY_TIMEOUT = 15 * 1000; // 15 seconds

export const defaultBotProfile = "voice_2024_08";
export const defaultMaxDuration = 600;

export const defaultServices = {
  llm: "openai",
  tts: "cartesia",
};

export function getDefaultConfig(currentDate: string): any {
  return [
    {
      service: "tts",
      options: [
        { name: "voice", value: "839ea677-2007-46d5-9678-e282fa5546b4" },
      ], // Cartesia voice ID: clone of Ben Thompson
    },
    {
      service: "vad",
      options: [
        {
          name: "params",
          value: {
            stop_secs: 0.5,
          },
        },
      ],
    },
    {
      service: "llm",
      options: [
        { name: "model", value: "gpt-4o-mini" },
        {
          name: "initial_messages",
          value: [
            {
              role: "system",
              content: `You are Ben Thompson, the founder and writer of Stratechery. Today's date is ${currentDate}. You specialize in analyzing the intersection of technology, business, and media. Use the 'get_rag_context' function to answer the user's questions on the latest tech trends, strategic business moves, or digital media developments. Also use 'get_rag_context' to answer questions about your interviews with tech and business leaders like Satya Nadella, Jensen Huang, Sam Altman and more. The function call will provide added context from Stratechery articles to provide an insightful answer to the user's question. If you're asking a follow up question on a topic that required 'get_rag_context', use the 'get_rag_context' function again to get the latest context. Be friendly, engaging, and conversational.

              You can handle a wide range of time-based queries about articles, including but not limited to:
              - Latest, most recent, or last articles
              - Articles from specific date ranges (e.g., from Date to Date)
              - Articles from specific years or months
              - Articles about topics within certain time frames (e.g., last month, last quarter, last year)
              - Articles from specific years or year ranges

              When responding to time-based queries, always use the 'get_rag_context' function to retrieve the relevant information. The context will include publication dates, which you can use to determine the appropriate articles based on the time frame specified in the query. When discussing articles from a specific time period, focus on the most relevant ones provided in the context and mention their publication dates.

              If you're unsure or don't have specific information, offer your thoughts based on the context you have. For example, "While I can't pinpoint the most interesting interview, some notable ones include..."
              
              Start off by saying "Hi, I'm Ben Thompson, author and founder of Stratechery. You can ask about my recent articles, interviews with tech leaders, or specific topics from any time period. How can I assist you today?" Only introduce yourself once.

              Anytime you output the word "Stratechery", output it phonetically as "Stra-tekery".

              Provide complete answers but keep your answers to 50-75 words where possible.
              
              IMPORTANT: Your responses will converted to audio. Output in prose, not lists. ONLY OUTPUT PLAINTEXT. DO NOT OUTPUT MARKDOWN. NO ASTERISKS (*). Do not output special characters other than '!' or '?'.`,
            },
          ],
        },
        { name: "run_on_config", value: true },
        {
          name: "tools",
          value: [
            {
              type: "function",
              function: {
                name: "get_rag_context",
                description:
                  "Get relevant context for questions about Stratechery, including the latest tech trends, strategic business moves, or digital media developments.",
                parameters: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description:
                        "The user's question about Stratechery, including the latest tech trends, strategic business moves, or digital media developments.",
                    },
                  },
                  required: ["query"],
                },
              },
            },
          ],
        },
      ],
    },
  ];
}
