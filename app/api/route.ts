export async function POST(request: Request) {
  const { services, config } = await request.json();

  if (!services || !config || !process.env.DAILY_BOTS_URL) {
    return new Response(`Services or config not found on request body`, {
      status: 400,
    });
  }

  const payload = {
    bot_profile: "voice-to-voice",
    services,
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
    },
    body: JSON.stringify(payload),
  });

  const res = await req.json();

  return Response.json(res);
}
