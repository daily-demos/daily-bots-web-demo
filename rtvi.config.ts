export const BOT_READY_TIMEOUT = 15 * 1000; // 15 seconds

export const defaultBotProfile = "voice_2024_08";
export const defaultMaxDuration = 600;

export const defaultServices = {
  llm: "openai",
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
      { name: "model", value: "gpt-4o-mini" },
      {
        name: "initial_messages",
        value: [
          {
            role: "system",
            content: `
            You are a a radio engineer at an F1 race. I'm the race director. Your job is to answer my questions as quickly and efficiently as possible. Keep your responses very, very short. If you can answer in one or two words, do that. If I ask when something happened, give me lap numbers, not times. If I ask something about the last lap, I mean the highest-numbered completed lap so far.  If I ask you to show me something or graph something, call the 'graph' function.
            
            Use these colors for driver graphs:
            valtteri bottas: #00e701,
            zhou guanyu: #008d01,
            theo pourchaire: #004601,
            
            nyck de vries: #1e3d61,
            yuki tsunoda: #356cac,
            daniel ricciardo: #2b4562,
            liam lawson: #2b4562,
            isack hadjar: #1e6176,
            ayumu iwasa: #1e6176,
            
            pierre gasly: #fe86bc,
            esteban ocon: #ff117c,
            jack doohan: #894667,
            
            fernando alonso: #006f62,
            lance stroll: #00413b,
            felipe drugovich: #2f9b90,
            
            charles leclerc: #dc0000,
            carlos sainz: #ff8181,
            robert shwartzman: #9c0000,
            oliver bearman: #c40000,
            
            kevin magnussen: #999999,
            nico hulkenberg: #cacaca,
            
            oscar piastri: #ff8700,
            lando norris: #eeb370,
            pato oward: #ee6d3a,
            
            lewis hamilton: #00d2be,
            george russell: #24ffff,
            frederik vesti: #00a6ff,
            
            max verstappen: #fcd700,
            sergio perez: #ffec7b,
            jake dennis: #907400,
            
            alexander albon: #005aff,
            logan sargeant: #012564,
            zak osullivan: #1b3d97,
            franco colapinto: #639aff
            `,
          },
        ],
      },
      {
        name: "tools",
        value: [
          {
            type: "function",
            function: {
              name: "drivers",
              description:
                "Provides information about drivers for each session.",
              parameters: {
                type: "object",
                properties: {
                  driver_number: {
                    type: "string",
                    description: "The unique number assigned to an F1 driver",
                  },
                  first_name: {
                    type: "string",
                    description: "The driver's first name.",
                  },
                  last_name: {
                    type: "string",
                    description: "The driver's last name.",
                  },
                  full_name: {
                    type: "string",
                    description: "The driver's full name.",
                  },
                },
                required: [],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "laps",
              description:
                "Provides detailed information about each of a driver's laps.",
              parameters: {
                type: "object",
                properties: {
                  driver_number: {
                    type: "string",
                    description: "The unique number assigned to an F1 driver",
                  },
                  lap_number: {
                    type: "string",
                    description:
                      "The sequential number of the lap within the session (starts at 1).",
                  },
                },
                required: [],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "stints",
              description:
                "Provides information about individual stints. A stint refers to a period of continuous driving by a driver during a session.",
              parameters: {
                type: "object",
                properties: {
                  driver_number: {
                    type: "string",
                    description: "The unique number assigned to an F1 driver",
                  },
                  stint_number: {
                    type: "string",
                    description:
                      "The sequential number of the stint within the session (starts at 1).",
                  },
                },
                required: [],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "pit",
              description:
                "Provides information about cars going through the pit lane.",
              parameters: {
                type: "object",
                properties: {
                  driver_number: {
                    type: "string",
                    description: "The unique number assigned to an F1 driver",
                  },
                },
                required: [],
              },
            },
          },
          {
            type: "function",
            function: {
              name: "graph",
              description: "Draws the requested graph.",
              parameters: {
                type: "object",
                properties: {
                  graph_data: {
                    type: "string",
                    description:
                      "A JSON string with to create a line chart with chart.js",
                  },
                },
                required: [],
              },
            },
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
        label: "Meta Llama 3.1 70B Instruct Turbo",
        value: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      },
      {
        label: "Meta Llama 3.1 8B Instruct Turbo",
        value: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
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
    label: "Open AI",
    value: "openai",
    models: [
      {
        label: "GPT-4o",
        value: "gpt-4o",
      },
      {
        label: "GPT-4o Mini",
        value: "gpt-4o-mini",
      },
    ],
  },
];

export const TTS_VOICES = [
  { name: "Britsh Lady", value: "79a125e8-cd45-4c13-8a67-188112f4dd22" },
];
