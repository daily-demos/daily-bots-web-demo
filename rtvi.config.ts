export const BOT_READY_TIMEOUT = 15 * 1000; // 15 seconds

export const defaultBotProfile = "voice_2024_08";
export const defaultMaxDuration = 600;

export const defaultServices = {
  llm: "together",
  tts: "cartesia",
};

const weatherTool = {
  name: "get_weather",
  description: "Get the current weather in a given location",
  parameters: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description:
          "The user's location in the form 'city,state,country'. For example, if the user is in Austin, TX, use 'austin,tx,us'.",
      },
    },
    required: ["location"],
  },
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
      // or meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo
      { name: "model", value: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo" },
      // {
      //   name: "initial_messages",
      //   value: [
      //     {
      //       // anthropic: user; openai: system

      //       role: "user",
      //       content:
      //         `You are a TV weatherman named Wally. Your job is to present the weather to me. You can call the 'get_weather' function to get weather information. Start by asking me for my location. Then, use 'get_weather' to give me a forecast. Then, answer any questions I have about the weather. Keep your introduction and responses very brief. You don't need to tell me if you're going to call a function; just do it directly. Keep your words to a minimum. When you're delivering the forecast, you can use more words and personality.`,
      //     },
      //   ],
      // },

      // Together
      {
        name: "initial_messages",
        value: [
          {
            // anthropic: user; openai: system

            role: "system",
            content: `
            You have access to the following functions:

              Use the function '${weatherTool["name"]}' to '${
              weatherTool["description"]
            }':
              ${JSON.stringify(weatherTool)}

              If you choose to call a function ONLY reply in the following format with no prefix or suffix:

              <function=example_function_name>{{\"example_name\": \"example_value\"}}</function>

              Reminder:
              - Function calls MUST follow the specified format, start with <function= and end with </function>
              - Required parameters MUST be specified
              - Only call one function at a time
              - Put the entire function call reply on one line
              - If there is no function call available, answer the question like normal with your current knowledge and do not tell the user about function calls.

            You are a TV weatherman named Wally. Your job is to present the weather to me. You can call the 'get_weather' function to get weather information. Start by asking me for my location. Then, use 'get_weather' to give me a forecast. Then, answer any questions I have about the weather. Keep your introduction and responses very brief. You don't need to tell me if you're going to call a function; just do it directly. Keep your words to a minimum. When you're delivering the forecast, you can use more words and personality.`,
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
      //               description: "The user's location in the form 'city,state,country'. For example, if the user is in Austin, TX, use 'austin,tx,us'.",
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

      // {
      //   name: "tools",
      //   value: [
      //     {
      //       name: "get_weather",
      //       description:
      //         "Get the current weather for a location. This includes the conditions as well as the temperature.",
      //       input_schema: {
      //         type: "object",
      //         properties: {
      //           location: {
      //             type: "string",
      //             description:
      //               "The user's location in the form 'city,state,country'. For example, if the user is in Austin, TX, use 'austin,tx,us'.",
      //           },
      //           format: {
      //             type: "string",
      //             enum: ["celsius", "fahrenheit"],
      //             description:
      //               "The temperature unit to use. Infer this from the user's location.",
      //           },
      //         },
      //         required: ["location", "format"],
      //       },
      //     },
      //   ],
      // },
    ],
  },
];
