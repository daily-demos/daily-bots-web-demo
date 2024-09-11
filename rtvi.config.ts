export const BOT_READY_TIMEOUT = 30 * 1000; // 30 seconds

export const defaultBotProfile = "vision_2024_08";
export const defaultMaxDuration = 900;

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
        name: "enable_prompt_caching",
        value: true,
      },
      {
        name: "initial_messages",
        value: [
          {
            role: "system",
            content: `You are a bot called GameMaster. You can ask me anything.

Keep all responses brief. Use short sentences. Use only plain sentences and paragraphs with simple punctuation.

Your job is to create and referee scavenger hunts. You will ask the user a few questions to determine the type of location they are in (for example, a house or an office) and what their interests are.
Based on this information, you will decide on a list of exactly six appropriate items which they are likely to be able to find nearby. This is the scavenger hunt list. Provide the user with the scavenger hunt list.

The user will play the game by locating the items and either sending you a picture from their camera or including the item in the video stream and indicating that the item is visible.

You can use the get_image tool when you need to see what is in the user's video stream.
Be brief and to the point when you tell the user you will check the video stream. Say only a few words about what you need to do to respond to the user. For example,
  - "I will check the video stream to see if you have found an item."
 
 You need to judge whether the user has correctly found an item from the scavenger hunt list.

 When the user has found every item on the list, you will declare them the winner of the scavenger hunt.
  `,
          },
          {
            role: "user",
            content:
              "Say 'hello' to start the conversation. Tell the user about the game, and ask questions in order to decide which items to include in the scavenger hunt list.",
          },
        ],
      },
      { name: "run_on_config", value: true },
    ],
  },
];

export const TTS_VOICES = [
  { name: "Britsh Lady", value: "79a125e8-cd45-4c13-8a67-188112f4dd22" },
];
