import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const req_data = await request.json();
  console.log(req_data);

  const temperature = Math.floor(Math.random() * (80 - 40 + 1)) + 40;
  console.log(`Returning temperature: ${temperature}`);
  return NextResponse.json({ temperature })
}
