import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";

// Define types for our metadata and results
type ChunkMetadata = {
  title: string;
  content: string;
  file_name: string;
  chunk_index: number;
  published_date: number;
};

type QueryResult = {
  score: number;
  metadata: ChunkMetadata;
};

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const chatModel = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export async function query_similar_content(
  query: string,
  top_k: number = 5,
  date_filter?: { $gte?: number; $lte?: number }
): Promise<QueryResult[]> {
  console.time("query_similar_content");
  try {
    const index = pinecone.Index("stratechery-rag-demo");

    const queryEmbedding = await embeddings.embedQuery(query);

    const queryOptions: any = {
      vector: queryEmbedding,
      topK: top_k,
      includeMetadata: true,
    };

    if (date_filter) {
      queryOptions.filter = { published_date: date_filter };
    }

    const queryResponse = await index.query(queryOptions);

    console.timeEnd("query_similar_content");

    const results: QueryResult[] =
      queryResponse.matches?.map((match) => ({
        score: match.score || 0,
        metadata: {
          title: (match.metadata?.title as string) || "Untitled",
          content: (match.metadata?.content as string) || "",
          file_name: (match.metadata?.file_name as string) || "",
          chunk_index: (match.metadata?.chunk_index as number) || 0,
          published_date: (match.metadata?.published_date as number) || 0,
        },
      })) ?? [];

    console.log(`RAG Results for query: "${query}"`);
    results.forEach((result, index) => {
      console.log(`\nResult ${index + 1}:`);
      console.log(`Score: ${result.score}`);
      console.log(`Title: ${result.metadata.title}`);
      console.log(`File: ${result.metadata.file_name}`);
      console.log(
        `Published Date: ${
          new Date(result.metadata.published_date * 1000)
            .toISOString()
            .split("T")[0]
        }`
      );
      console.log(`Chunk Index: ${result.metadata.chunk_index}`);
      console.log(
        `Content Preview: ${result.metadata.content.substring(0, 100)}...`
      );
    });

    return results;
  } catch (error) {
    console.error("Error in query_similar_content:", error);
    throw new Error("Failed to query similar content");
  }
}

export async function generateResponse(
  query: string,
  ragResults: QueryResult[]
) {
  console.time("generateResponse");
  try {
    const context = ragResults
      .map(
        (result) =>
          `Title: ${result.metadata.title}\nPublished Date: ${
            new Date(result.metadata.published_date * 1000)
              .toISOString()
              .split("T")[0]
          }\nContent: ${result.metadata.content}`
      )
      .join("\n\n");

    const prompt = PromptTemplate.fromTemplate(`
        You are a helpful assistant that answers questions based on the provided context. If the context doesn't contain relevant information, say so.

        Context:
        {context}

        Question: {query}

        Answer:
      `);

    const chain = RunnableSequence.from([
      {
        context: (input: any) => input.context,
        query: (input: any) => input.query,
      },
      prompt,
      chatModel,
      new StringOutputParser(),
    ]);

    let tokenUsage = {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };

    const response = await chain.invoke(
      {
        context,
        query,
      },
      {
        callbacks: [
          {
            handleLLMEnd: (output) => {
              const usage = output.llmOutput?.tokenUsage;
              tokenUsage = {
                promptTokens: usage?.promptTokens || 0,
                completionTokens: usage?.completionTokens || 0,
                totalTokens: usage?.totalTokens || 0,
              };
              console.log("Token Usage:", tokenUsage);
            },
          },
        ],
      }
    );

    console.timeEnd("generateResponse");
    console.log(`Generated response for query: "${query}"`);

    return { response, tokenUsage };
  } catch (error) {
    console.error("Error in generateResponse:", error);
    throw new Error("Failed to generate response");
  }
}

export function parseDateQuery(
  query: string
): { $gte?: number; $lte?: number } | null {
  const now = new Date();
  const months: { [key: string]: number } = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };

  // Helper function to get date from relative time
  const getRelativeDate = (amount: number, unit: string): Date => {
    const date = new Date();
    switch (unit) {
      case "day":
      case "days":
        date.setDate(date.getDate() - amount);
        break;
      case "week":
      case "weeks":
        date.setDate(date.getDate() - amount * 7);
        break;
      case "month":
      case "months":
        date.setMonth(date.getMonth() - amount);
        break;
      case "year":
      case "years":
        date.setFullYear(date.getFullYear() - amount);
        break;
    }
    return date;
  };

  // Latest, recent, or last article
  if (/latest|recent|last|newest/i.test(query)) {
    const sixMonthsAgo = getRelativeDate(6, "months").getTime() / 1000;
    return { $gte: sixMonthsAgo };
  }

  // Specific time range
  const timeRangeRegex = /in the last (\d+) (day|week|month|year)s?/i;
  const timeRangeMatch = query.match(timeRangeRegex);
  if (timeRangeMatch) {
    const amount = parseInt(timeRangeMatch[1]);
    const unit = timeRangeMatch[2].toLowerCase();
    const startDate = getRelativeDate(amount, unit).getTime() / 1000;
    return { $gte: startDate };
  }

  // Date range
  const dateRangeRegex = /from (.+) to (.+)/i;
  const dateRangeMatch = query.match(dateRangeRegex);
  if (dateRangeMatch) {
    const startDate = new Date(dateRangeMatch[1]);
    const endDate = new Date(dateRangeMatch[2]);
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      return {
        $gte: startDate.getTime() / 1000,
        $lte: endDate.getTime() / 1000,
      };
    }
  }

  // Specific month and year
  const monthYearRegex = new RegExp(
    `\\b(${Object.keys(months).join("|")})\\s+(\\d{4})\\b`,
    "i"
  );
  const monthYearMatch = query.match(monthYearRegex);
  if (monthYearMatch) {
    const month = months[monthYearMatch[1].toLowerCase()];
    const year = parseInt(monthYearMatch[2]);
    const startDate = new Date(year, month, 1).getTime() / 1000;
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).getTime() / 1000;
    return { $gte: startDate, $lte: endDate };
  }

  // Specific year
  const yearRegex = /\b(\d{4})\b/;
  const yearMatch = query.match(yearRegex);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    const startDate = new Date(year, 0, 1).getTime() / 1000;
    const endDate = new Date(year, 11, 31, 23, 59, 59).getTime() / 1000;
    return { $gte: startDate, $lte: endDate };
  }

  return null;
}
