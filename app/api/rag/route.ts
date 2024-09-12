import { NextResponse } from "next/server";

import {
  generateResponse,
  parseDateQuery,
  query_similar_content,
} from "@/utils/rag_query";

export async function POST(request: Request) {
  const { query } = await request.json();

  try {
    const startTime = performance.now();

    const dateFilter = parseDateQuery(query);

    const querySimilarContentStartTime = performance.now();
    const ragResults = await query_similar_content(
      query,
      5,
      dateFilter || undefined
    );
    const querySimilarContentTime =
      performance.now() - querySimilarContentStartTime;

    const generateResponseStartTime = performance.now();
    const { response: llmResponse, tokenUsage } = await generateResponse(
      query,
      ragResults
    );
    const generateResponseTime = performance.now() - generateResponseStartTime;

    const totalRAGTime = performance.now() - startTime;

    const uniqueLinksSet = new Set();

    const links = ragResults
      .map((result) => {
        const file = result.metadata.file_name;
        const title = result.metadata.title.replace(/\s*-\s*Chunk\s*\d+$/, "");
        const url = `https://stratechery.com/${file.split("_")[0]}/${file
          .split("_")[1]
          .replace(".json", "")}/`;

        const linkIdentifier = `${title}|${url}`;

        if (!uniqueLinksSet.has(linkIdentifier)) {
          uniqueLinksSet.add(linkIdentifier);
          return { title, url };
        }

        return null;
      })
      .filter(Boolean);

    const ragStats = {
      querySimilarContentTime,
      generateResponseTime,
      totalRAGTime,
      links,
      tokenUsage,
    };

    return NextResponse.json({ ragResults, llmResponse, ragStats });
  } catch (error) {
    console.error("RAG query error:", error);
    return NextResponse.json(
      { error: "Failed to process query", details: (error as Error).message },
      { status: 500 }
    );
  }
}
