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
  top_k: number = 5
): Promise<QueryResult[]> {
  console.time("query_similar_content");
  try {
    const index = pinecone.Index("stratechery-articles");

    // Generate embedding for the query
    const queryEmbedding = await embeddings.embedQuery(query);

    // Query Pinecone
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: top_k,
      includeMetadata: true,
    });

    console.timeEnd("query_similar_content");

    // Format and log the results
    const results: QueryResult[] =
      queryResponse.matches?.map((match) => ({
        score: match.score || 0,
        metadata: {
          title: (match.metadata?.title as string) || "Untitled",
          content: (match.metadata?.content as string) || "",
          file_name: (match.metadata?.file_name as string) || "",
          chunk_index: (match.metadata?.chunk_index as number) || 0,
        },
      })) ?? [];

    console.log(`RAG Results for query: "${query}"`);
    results.forEach((result, index) => {
      console.log(`\nResult ${index + 1}:`);
      console.log(`Score: ${result.score}`);
      console.log(`Title: ${result.metadata.title}`);
      console.log(`File: ${result.metadata.file_name}`);
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
          `Title: ${result.metadata.title}\nContent: ${result.metadata.content}`
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
              console.log("Token Usage:", {
                prompt_tokens: usage?.promptTokens || 0,
                completion_tokens: usage?.completionTokens || 0,
                total_tokens: usage?.totalTokens || 0,
              });
            },
          },
        ],
      }
    );

    console.timeEnd("generateResponse");
    console.log(`Generated response for query: "${query}"`);

    return { response };
  } catch (error) {
    console.error("Error in generateResponse:", error);
    throw new Error("Failed to generate response");
  }
}
