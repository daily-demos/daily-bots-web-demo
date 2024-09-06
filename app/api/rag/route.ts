import { NextResponse } from "next/server";

import { hierarchicalRetrieval } from "@/utils/rag_query";

export async function POST(request: Request) {
  const { query } = await request.json();

  try {
    const { response, ragResults, level } = await hierarchicalRetrieval(query);
    return NextResponse.json({ ragResults, llmResponse: response, level });
  } catch (error) {
    console.error("RAG query error:", error);
    return NextResponse.json(
      { error: "Failed to process query", details: (error as Error).message },
      { status: 500 }
    );
  }
}
