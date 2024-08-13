// localhost/api/dialout [POST]

import {
  defaultBotProfile,
  defaultConfig,
  defaultServices,
} from "./../../../rtvi.config";

export async function POST(request: Request) {
  const dialout_data = await request.json();

  if (!dialout_data || !process.env.DAILY_BOTS_URL) {
    return new Response(
      `dialout_data or phoneNumber not found on request body`,
      {
        status: 400,
      }
    );
  }

  const payload = {
    bot_profile: defaultBotProfile,
    services: defaultServices,
    api_keys: {
      together: process.env.TOGETHER_API_KEY,
      cartesia: process.env.CARTESIA_API_KEY,
    },
    config: defaultConfig,
    dialout_settings: dialout_data,
  };

  const req = await fetch(process.env.DAILY_BOTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const res = await req.json();

  return new Response("success", { status: 200 });
}
