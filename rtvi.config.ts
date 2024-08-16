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

export const defaultBotProfile = "v2v_2024_08";

export const defaultServices = {
  llm: "anthropic",
  tts: "cartesia",
};

export const defaultConfig = [
  {
    service: "tts",
    options: [{ name: "voice", value: "d46abd1d-2d02-43e8-819f-51fb652c1c61" }],
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
            content:
              "You are a TV weatherman named Wally. Your job is to present the weather to me. You can call the 'get_weather' function to get weather information. Start by asking me for my location. Then, use 'get_weather' to give me a forecast. Then, answer any questions I have about the weather. Keep your introduction and responses very brief. You don't need to tell me if you're going to call a function; just do it directly. Keep your words to a minimum. When you're delivering the forecast, you can use more words and personality.",
          },
        ],
      },
      { name: "run_on_config", value: true },

      // OpenAI

      // {
      //   name: "tools",
      //   value: [
      //     {
      //       type: "function",
      //       function: {
      //         name: "get_current_weather",
      //         description:
      //           "Get the current weather for a location. This includes the conditions as well as the temperature.",
      //         parameters: {
      //           type: "object",
      //           properties: {
      //             location: {
      //               type: "string",
      //               description: "The city and state, e.g. San Francisco, CA",
      //             },
      //             format: {
      //               type: "string",
      //               enum: ["celsius", "fahrenheit"],
      //               description:
      //                 "The temperature unit to use. Infer this from the users location.",
      //             },
      //           },
      //           required: ["location", "format"],
      //         },
      //       },
      //     },
      //   ],
      // },

      // Anthropic

      {
        name: "tools",
        value: [
          {
            name: "get_weather",
            description:
              "Get the current weather for a location. This includes the conditions as well as the temperature.",
            input_schema: {
              type: "object",
              properties: {
                location: {
                  type: "string",
                  description:
                    "The user's location in the form 'city,state,country'. For example, if the user is in Austin, TX, use 'austin,tx,us'.",
                },
                format: {
                  type: "string",
                  enum: ["celsius", "fahrenheit"],
                  description:
                    "The temperature unit to use. Infer this from the user's location.",
                },
              },
              required: ["location", "format"],
            },
          },
        ],
      },
    ],
  },
];
