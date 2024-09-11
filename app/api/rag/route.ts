import { NextResponse } from "next/server";

import { generateResponse, query_similar_content } from "@/utils/rag_query";

export async function POST(request: Request) {
  const { query } = await request.json();

  try {
    const startTime = performance.now();

    const querySimilarContentStartTime = performance.now();
    const ragResults = await query_similar_content(query);
    const querySimilarContentTime =
      performance.now() - querySimilarContentStartTime;

    const generateResponseStartTime = performance.now();
    const llmResponse = await generateResponse(query, ragResults);
    const generateResponseTime = performance.now() - generateResponseStartTime;

    const totalRAGTime = performance.now() - startTime;

    // Create a Set to store unique links
    const uniqueLinksSet = new Set();

    const links = ragResults
      .map((result) => {
        const file = result.metadata.file_name;
        // Remove " - Chunk X" from the title
        const title = result.metadata.title.replace(/\s*-\s*Chunk\s*\d+$/, "");
        const url = `https://stratechery.com/${file.split("_")[0]}/${file
          .split("_")[1]
          .replace(".json", "")}/`;

        // Create a unique identifier for each link
        const linkIdentifier = `${title}|${url}`;

        // If this link is not in the Set, add it and return the link object
        if (!uniqueLinksSet.has(linkIdentifier)) {
          uniqueLinksSet.add(linkIdentifier);
          return { title, url };
        }

        // If it's already in the Set, return null
        return null;
      })
      .filter(Boolean); // Remove null entries

    const ragStats = {
      querySimilarContentTime,
      generateResponseTime,
      totalRAGTime,
      links,
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
