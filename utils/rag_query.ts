import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatOpenAI } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";

const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-3-small",
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const chatModel = new ChatOpenAI({
  modelName: "gpt-4o",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

export async function query_similar_content(query: string, top_k: number = 5) {
  try {
    const index = pinecone.Index("stratechery-articles");

    // Generate embedding for the query
    const queryEmbedding = await embeddings.embedQuery(query);

    // Query Pinecone directly
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: top_k,
      includeMetadata: true,
    });

    // Format the results
    return (
      queryResponse.matches?.map((match) => ({
        score: match.score,
        metadata: {
          title: match.metadata?.title ?? "Untitled",
          truncated_content: match.metadata?.truncated_content ?? "",
        },
      })) ?? []
    );
  } catch (error) {
    console.error("Error in query_similar_content:", error);
    throw new Error("Failed to query similar content");
  }
}

export async function generateResponse(query: string, ragResults: any[]) {
  try {
    const context = ragResults
      .map(
        (result) =>
          `Title: ${result.metadata.title}\nContent: ${result.metadata.truncated_content}`
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

    const response = await chain.invoke({
      context,
      query,
    });

    return response;
  } catch (error) {
    console.error("Error in generateResponse:", error);
    throw new Error("Failed to generate response");
  }
}
