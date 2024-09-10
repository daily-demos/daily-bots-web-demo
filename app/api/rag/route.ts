import { NextResponse } from "next/server";

import { generateResponse, query_similar_content } from "@/utils/rag_query";

export async function POST(request: Request) {
  const { query } = await request.json();

  console.log(`Received query: "${query}"`);
  console.time("total_rag_process");

  try {
    const ragResults = await query_similar_content(query);
    const { response: llmResponse, usage } = await generateResponse(
      query,
      ragResults
    );

    console.timeEnd("total_rag_process");
    console.log(`RAG process completed for query: "${query}"`);
    console.log("Total token usage:", usage);

    return NextResponse.json({ ragResults, llmResponse, usage });
  } catch (error) {
    console.error("RAG query error:", error);
    return NextResponse.json(
      { error: "Failed to process query", details: (error as Error).message },
      { status: 500 }
    );
  }
}
