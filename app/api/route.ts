// [POST] /api
import { defaultBotProfile, defaultMaxDuration } from "./../../rtvi.config";

export async function POST(request: Request) {
  const { services, config } = await request.json();

  if (!services || !config || !process.env.DAILY_BOTS_URL) {
    return new Response(`Services or config not found on request body`, {
      status: 400,
    });
  }

  const webhooks = [
    {
      url: "http://localhost:3000/api/get_weather",
      method: "POST",
      headers: {"Authorization": "Bearer ABCDEF"},
      events: [
        { event_name: "pre_llm" },
        { event_name: "post_llm" },
        { 
          event_name: "function_call",
          await_return: true        
        }
      ],
    },
    {
      url: "http://localhost:3000/api/webhook_events",
      method: "POST",
      headers: {"Authorization": "Bearer ABCDEF"},
      events: [
        { event_name: "pre_llm" },
        { event_name: "post_llm" },
      ],
    },
  ]
  

  const payload = {
    bot_profile: defaultBotProfile,
    max_duration: defaultMaxDuration,
    services,
    api_keys: {
      openai: process.env.OPENAI_API_KEY,
      elevenlabs: process.env.ELEVENLABS_API_KEY,
      what: "something"
    },
    config: [...config],
    webhooks,
  };

  const req = await fetch(process.env.DAILY_BOTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const res = await req.json();

  if (req.status !== 200) {
    return Response.json(res, { status: req.status });
  }

  return Response.json(res);
}
