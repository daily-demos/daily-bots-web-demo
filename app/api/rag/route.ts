import { NextResponse } from "next/server";

import { generateResponse, query_similar_content } from "@/utils/rag_query";

export async function POST(request: Request) {
  const { query } = await request.json();

  try {
    const ragResults = await query_similar_content(query);
    const llmResponse = await generateResponse(query, ragResults);
    return NextResponse.json({ ragResults, llmResponse });
  } catch (error) {
    console.error("RAG query error:", error);
    return NextResponse.json(
      { error: "Failed to process query", details: (error as Error).message },
      { status: 500 }
    );
  }
}
