export const BOT_READY_TIMEOUT = 30 * 1000; // 30 seconds

export const defaultBotProfile = "vision_2024_08";
export const defaultMaxDuration = 600;

export const defaultServices = {
  llm: "anthropic",
  tts: "cartesia",
};

export const defaultConfig = [
  {
    service: "tts",
    options: [{ name: "voice", value: "79a125e8-cd45-4c13-8a67-188112f4dd22" }],
  },
  {
    service: "llm",
    options: [
      { name: "model", value: "claude-3-5-sonnet-20240620" },
      {
        name: "initial_messages",
        value: [
          {
            role: "system",
            content: `You are a assistant called ExampleBot. You can ask me anything.

Keep all responses brief. Use short sentences. Use only plain sentences and paragraphis with simple punctuation.

You can answer questions about the user's video stream. The video stream is changing constantly, so you will usually need to use the tool to update your understanding whenever the user asks a question about the video.

Be brief and to the point when you tell the user you will check the video stream. Say only a few words about what you need to do to respond to the user. For example,
  - "I will check the video stream to answer that question."
  - "Let me see whether {question}."
  - "I will look into whether {question}, give me just a moment."
`,
          },
          {
            role: "user",
            content:
              "Say 'hello' to start the conversation. Tell the user you can answer questions about what you see on their camera.",
          },
        ],
      },
      { name: "run_on_config", value: true },
    ],
  },
];

export const TTS_VOICES = [
  { name: "Britsh Lady", value: "79a125e8-cd45-4c13-8a67-188112f4dd22" },
  { name: "California Girl", value: "b7d50908-b17c-442d-ad8d-810c63997ed9" }
];
