import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const locationParam = request.nextUrl.searchParams.get("location");
  if (!locationParam) {
    return Response.json({ error: "Unknown location" });
  }
  const location = decodeURI(locationParam);
  const excludeParam = request.nextUrl.searchParams.get("exclude");
  const exclude = ["minutely", "hourly", "daily"];
  if (excludeParam) {
    exclude.concat(excludeParam.split(","));
  }
  console.log("Getting weather for", location);
  const locationReq = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=52c6049352e0ca9c979c3c49069b414d`
  );
  const locJson = await locationReq.json();
  const loc = { lat: locJson[0].lat, lon: locJson[0].lon };
  console.log({ loc });
  const weatherRec = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${loc.lat}&lon=${
      loc.lon
    }&exclude=${exclude.join(",")}&appid=52c6049352e0ca9c979c3c49069b414d`
  );
  const weatherJson = await weatherRec.json();
  console.log({ weatherJson });
  return Response.json({ weather: weatherJson });
}
