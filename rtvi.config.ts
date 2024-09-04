export const BOT_READY_TIMEOUT = 15 * 1000; // 15 seconds
export const LATENCY_MIN = 300;
export const LATENCY_MAX = 3000;
export const VAD_POSITIVE_SPEECH_THRESHOLD = 0.8;
export const VAD_NEGATIVE_SPEECH_THRESHOLD = 0.8 - 0.15;
export const VAD_MIN_SPEECH_FRAMES = 5;
export const VAD_REDEMPTION_FRAMES = 3;
export const VAD_PRESPEECH_PAD_FRAMES = 1;

export type Language = {
  language: string;
  model_id: string;
  code: string;
  voice: string;
};

export type Voice = {
  label: string;
  id: string;
};

export type LLMModel = {
  label: string;
  id: string;
};

export const ttsVoices: Voice[] = [
  { label: "Default", id: "79a125e8-cd45-4c13-8a67-188112f4dd22" },
  { label: "California Girl", id: "b7d50908-b17c-442d-ad8d-810c63997ed9" },
  { label: "Friendly Reading Man", id: "69267136-1bdc-412f-ad78-0caad210fb40" },
  { label: "Kentucky Man", id: "726d5ae5-055f-4c3d-8355-d9677de68937" },
];

export const languages: Language[] = [
  {
    language: "English",
    model_id: "sonic-english",
    code: "en",
    voice: "79a125e8-cd45-4c13-8a67-188112f4dd22",
  },
  {
    language: "French",
    model_id: "sonic-multilingual",
    code: "fr",
    voice: "a8a1eb38-5f15-4c1d-8722-7ac0f329727d",
  },
];

export const llmModels: LLMModel[] = [
  { label: "LLama3 70b", id: "llama-3.1-70b-versatile" },
  { label: "Llama3 8b", id: "llama-3.1-8b-instant" },
];

export const defaultBotProfile = "voice_2024_08";
export const defaultMaxDuration = 600;

export const defaultServices = {
  llm: "anthropic",
  tts: "cartesia",
};

const content = `
      You are an English teacher named Uncle Jeff. Your job is to teach words you receive from the get_vocabulary_word tool.

  Keep responses brief and legible.
  Only use words a 3rd grader would understand.
  Your responses will converted to audio. Please do not include any special characters in your response other than '!' or '?'.
  Start by briefly introducing yourself and asking my name.

  You teach these words by introducing each one one at a time and then asking me to provide an example sentence for each word. Do not move on to the next word until I provide a perfect sentence.
    `;

export const defaultConfig = [
  {
    service: "tts",
    options: [{ name: "voice", value: "69267136-1bdc-412f-ad78-0caad210fb40" }],
  },
  {
    service: "llm",
    options: [
      // or claude-3-5-sonnet-20240620
      { name: "model", value: "claude-3-5-sonnet-20240620" },
      {
        name: "initial_messages",
        value: [
          {
            // anthropic: user; openai: system

            role: "system",
            content,
          },
        ],
      },
      { name: "run_on_config", value: true },

      // Anthropic

      {
        name: "tools",
        value: [
          {
            name: "get_vocabulary_word",
            description:
              "Get the vocabulary word and image url for that vocabulary word.",
            input_schema: {
              type: "object",
              properties: {
                word: {
                  type: "string",
                  description: "The vocabulary word.",
                },
                url: {
                  type: "string",
                  description: "The url for the image of the vocabulary word.",
                },
              },
            },
          },
        ],
      },
    ],
  },
];
