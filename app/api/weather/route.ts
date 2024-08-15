import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const location = request.nextUrl.searchParams.get("location");
  console.log("Getting weather for", location);
  const req = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=52c6049352e0ca9c979c3c49069b414d`
  );
  const locJson = await req.json();
  const loc = { lat: locJson[0].lat, lon: locJson[0].lon };
  console.log({ loc });
  return Response.json({ loc });
}
