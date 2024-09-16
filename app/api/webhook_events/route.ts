import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const req_data = await request.json();
  console.log(req_data);

  return NextResponse.json({ status: "success" });
}
