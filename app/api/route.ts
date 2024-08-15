// localhost/api [POST]

import { defaultBotProfile } from "./../../rtvi.config";

export async function POST(request: Request) {
  const { services, config } = await request.json();

  if (!services || !config || !process.env.DAILY_BOTS_URL) {
    return new Response(`Services or config not found on request body`, {
      status: 400,
    });
  }

  const payload = {
    bot_profile: defaultBotProfile,
    services,
    max_duration: 600,
    api_keys: {
      together: process.env.TOGETHER_API_KEY,
      cartesia: process.env.CARTESIA_API_KEY,
    },
    config: [...config],
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

  return Response.json(res);
}
