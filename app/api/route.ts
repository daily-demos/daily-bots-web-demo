export async function POST(request: Request) {
  const { services, config } = await request.json();

  if (!services || !config) {
    return new Response(`Services or config not found on request body`, {
      status: 400,
    });
  }

  const payload = {
    services,
    api_keys: [
      { llm: process.env.TOGETHER_API_KEY },
      { tts: process.env.CARTESIA_API_KEY },
    ],
    config: {
      ...config,
    },
  };

  console.log(payload);

  // @TODO: call endpoint here

  return Response.json({ hello: "world" });
}
