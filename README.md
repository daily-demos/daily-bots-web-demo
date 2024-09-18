[![Try](https://img.shields.io/badge/try_it-here-blue)](https://anthropic.dailybots.ai)
[![Deploy](https://img.shields.io/badge/Deploy_to_Vercel-black?style=flat&logo=Vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdaily-demos%2Fdaily-bots-web-demo&env=DAILY_BOTS_URL,DAILY_API_KEY,NEXT_PUBLIC_BASE_URL&project-name=daily-bots-demo&repository-name=daily-bots-web-demo)

<img src="public/icon.png" width="120px">

# Daily Bots RAG demo

Example NextJS app that demonstrates core capabilities of [Daily Bots](https://bots.daily.co).

## Other demos

- [Multi-model](https://github.com/daily-demos/daily-bots-web-demo/) - Main demo showcase.
- [Vision](https://github.com/daily-demos/daily-bots-web-demo/tree/khk/vision-for-launch) - Anthropic, describe webcam.
- [Function calling](https://github.com/daily-demos/daily-bots-web-demo/tree/cb/function-calling) - Anthropic with function calling

## Getting started

### Prerequisites

1. Create an OpenAI developer account at https://platform.openai.com and copy your OpenAI API key.
2. Create a Pinecone account at https://login.pinecone.io.
3. Create a new Pinecone project. This project will contain your vector DB, which will store your embeddings.

- Create index
- Set up your index by model > select `text-embedding-3-small`
- Select Capacity mode > Serverless > AWS > Region. Take note of your region, you'll use this below.

### Configure your local environment

```shell
cp env.example .env.local
```

`NEXT_PUBLIC_BASE_URL` defaults to `/api`, which is configured as Next server-side route handler. You can pass through service API keys, override service and config options within this route.

`DAILY_BOTS_URL` URL of the Daily Bots `start` endpoint (https://api.daily.co/v1/bots/start)

`DAILY_API_KEY` your Daily API key obtained by registering at https://bots.daily.co.

`OPENAI_API_KEY` your OpenAI API key.

`PINECONE_API_KEY` your Pinecone API key.

`PINECONE_ENVIRONMENT` your Pinecone index's region that you set up in Prerequisites. This should be a value like `us-east-1` or similar.

### Install dependencies

```shell
yarn
```

### Run the project

```shell
yarn run dev
```

## How does this work?

Daily Bots is built on two open-source technologies:

- [Pipecat](https://www.pipecat.ai) - Python library for building real-time agent
- [RTVI](https://github.com/rtvi-ai) - Open-standard for Real-Time Voice [and Video] Inference

This project makes use of [`realtime-ai`](https://www.npmjs.com/package/realtime-ai), [`realtime-ai-react`](https://www.npmjs.com/package/realtime-ai-react) and [`realtime-ai-daily`](https://www.npmjs.com/package/realtime-ai-daily) to interact with the Daily Bot.

Learn more about the RTVI web client libraries [on the docs](https://docs.rtvi.ai).

### Configuration

All Voice Client configuration can be found in the [rtvi.config.ts](/rtvi.config.ts) file. You can edit any prompts, services of config settings in this file.

### API routes

This project has two server-side routes:

- [api/route.ts](app/api/route.ts): Used to start your Daily Bot
- [api/rag/route.ts](app/api/rag/route.ts): Used to query your vector DB

The routes project a secure way to pass any required secrets or configuration directly to the Daily Bots API. Your `NEXT_PUBLIC_BASE_URL` must point to your `/api` route and passed to the `VoiceClient`.

The routes are passed a `config` array and `services` map, which can be passed to the Daily Bots REST API, or modified securely.

Daily Bots `https://api.daily.co/v1/bots/start` has some required properties, which you can read more about [here](https://docs.dailybots.ai/api-reference/endpoint/startBot). You must set:

- `bot_profile`
- `max_duration`
- `config`
- `services`

### RAG details

In the system message, located in [rtvi.config.ts](/rtvi.config.ts), you can see that the LLM has a single function call configured. This function call enables the LLM to query the vector DB when it requires supplementary information to respond to the user. You'll find the RAG query specifics in:

- [app/page.tsx](app/page.tsx), which is setting up the Daily Bot with access to the function call
- [api/rag/route.ts](app/api/rag/route.ts), which is the server-side route to query the vector DB
- [rag_query.ts](utils/rag_query.ts), which is a utility function with the core RAG querying logic

The data in the vector DB was created from the raw Stratechery articles. These articles where semantically chunked to create token efficient divisions of the articles. A key to a great conversational app is low latency interactions. The semantic chunks help to provide sufficient information to the LLM after a single RAG query, which helps the interaction remain low latency. You can see the time to first byte (TTFB) measurements along with the token use and links to source articles in the demo app—a drawer will pop out with this information after your first turn speaking to the LLM.
