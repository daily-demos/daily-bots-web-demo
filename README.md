[![Try](https://img.shields.io/badge/try_it-here-blue)](https://vision.dailybots.ai)
[![Deploy](https://img.shields.io/badge/Deploy_to_Vercel-black?style=flat&logo=Vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdaily-demos%2Fdaily-bots-web-demo&env=DAILY_BOTS_URL,DAILY_API_KEY,NEXT_PUBLIC_BASE_URL&project-name=daily-bots-demo&repository-name=daily-bots-web-demo)

<img src="public/icon.png" width="120px">

# Daily Bots Scavenger Hunt Game Demo

Example NextJS app that demonstrates vision capabilities of [Daily Bots](https://bots.daily.co) in the context of an entertaining game.

Uses `vision_2024_08` [Daily Bot profile](https://docs.dailybots.ai/api-reference/server/bot_profiles#bot-profiles).

This game is a modified version of the - [Vision](https://github.com/daily-demos/daily-bots-web-demo/tree/khk/vision-for-launch) example application.

In addition to the exciting game play (which comes simply from modifying the system prompt), this demo illustates:

- Adding image files directly to the LLM context.
- Anthropic's (beta) [prompt caching feature](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching). Because the game adds several image files to the LLM context, the context can grow quite large. Prompt caching reduces the fees for Anthropic usage by over 60% in a typical game.

## Other demos

- [Multi-model](https://github.com/daily-demos/daily-bots-web-demo/) - Main demo showcase.
- [Vision](https://github.com/daily-demos/daily-bots-web-demo/tree/khk/vision-for-launch) - Anthropic, describe webcam.

## Getting started

### Configure your local environment

```shell
cp env.example .env.local
```

`NEXT_PUBLIC_BASE_URL` defaults to `/api`, which is configured as Next server-side route handler. You can pass through service API keys, override service and config options within this route.

`DAILY_BOTS_URL` URL of the Daily Bots `start` endpoint (https://api.daily.co/v1/bots/start)

`DAILY_API_KEY` your Daily API key obtained by registering at https://bots.daily.co.

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

This project exposes one server-side route:

- [api/route.ts](app/api/route.ts)

The routes project a secure way to pass any required secrets or configuration directly to the Daily Bots API. Your `NEXT_PUBLIC_BASE_URL` must point to your `/api` route and passed to the `VoiceClient`.

The routes are passed a `config` array and `services` map, which can be passed to the Daily Bots REST API, or modified securely.

Daily Bots `https://api.daily.co/v1/bots/start` has some required properties, which you can read more about [here](https://docs.dailybots.ai/api-reference/endpoint/startBot). You must set:

- `bot_profile`
- `max_duration`
- `config`
- `services`
