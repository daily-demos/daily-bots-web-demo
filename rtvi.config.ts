export const BOT_READY_TIMEOUT = 15 * 1000; // 15 seconds

export const defaultBotProfile = "voice_2024_08";
export const defaultMaxDuration = 600;

export const defaultServices = {
  llm: "together",
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
      { name: "model", value: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo" },
      {
        name: "initial_messages",
        value: [
          {
            role: "system",
            content: `You are a assistant called ExampleBot. You can ask me anything.
              Keep responses brief and legible.
              Your responses will converted to audio. Please do not include any special characters in your response other than '!' or '?'.
              Start by briefly introducing yourself.`,
          },
        ],
      },
      { name: "run_on_config", value: true },
    ],
  },
];

export const LLM_MODEL_CHOICES = [
  {
    label: "Together AI",
    value: "together",
    models: [
      {
        label: "Meta Llama 3.1 8B Instruct Turbo",
        value: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      },
      {
        label: "Meta Llama 3.1 70B Instruct Turbo",
        value: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      },
      {
        label: "Meta Llama 3.1 405B Instruct Turbo",
        value: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
      },
    ],
  },
  {
    label: "Anthropic",
    value: "anthropic",
    models: [
      {
        label: "Claude 3.5 Sonnet",
        value: "claude-3-5-sonnet-20240620",
      },
    ],
  },
  {
    label: "Groq",
    value: "groq",
    models: [
      {
        label: "Llama 3.1 8B (Preview)",
        value: "llama-3.1-8b-instant",
      },
      {
        label: "Llama 3.1 70B (Preview)",
        value: "llama-3.1-70b-versatile",
      },
    ],
  },
  {
    label: "Open AI",
    value: "openai",
    models: [
      {
        label: "GPT-4o Mini",
        value: "gpt-4o-mini",
      },
      {
        label: "GPT-4o",
        value: "gpt-4o",
      },
    ],
  },
];

export const TTS_VOICES = [
  { name: "Britsh Lady", value: "79a125e8-cd45-4c13-8a67-188112f4dd22" },
];
