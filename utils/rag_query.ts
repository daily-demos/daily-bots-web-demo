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

async function query_similar_content(
  query: string,
  top_k: number = 3,
  level: string = "summary"
) {
  console.log(`Querying for ${level} content with query: "${query}"`);
  try {
    const index = pinecone.Index("stratechery-articles");
    const queryEmbedding = await embeddings.embedQuery(query);

    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: top_k,
      includeMetadata: true,
      filter: { level: level },
    });

    console.log(
      `Retrieved ${queryResponse.matches?.length || 0} ${level} results`
    );
    return (
      queryResponse.matches?.map((match) => ({
        score: match.score,
        metadata: {
          title: match.metadata?.title ?? "Untitled",
          truncated_content: match.metadata?.truncated_content ?? "",
          file_name: match.metadata?.file_name ?? "",
          level: match.metadata?.level ?? "",
        },
      })) ?? []
    );
  } catch (error) {
    console.error(`Error in query_similar_content for ${level}:`, error);
    throw new Error(`Failed to query similar content for ${level}`);
  }
}

async function generateResponse(
  query: string,
  ragResults: any[],
  detailLevel: string
) {
  console.log(`Generating response for ${detailLevel} level`);
  try {
    const context = ragResults
      .map(
        (result) =>
          `Title: ${result.metadata.title}\nLevel: ${result.metadata.level}\nContent: ${result.metadata.truncated_content}`
      )
      .join("\n\n");

    const prompt = PromptTemplate.fromTemplate(`
      You are a helpful assistant that answers questions based on the provided context. If the context doesn't contain relevant information, say so.

      Context:
      {context}

      Question: {query}

      Detail Level: ${detailLevel}
      ${
        detailLevel !== "summary"
          ? "Please provide a more detailed answer based on the expanded context."
          : ""
      }

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

    console.log(`Generated response for ${detailLevel} level`);
    return response;
  } catch (error) {
    console.error(`Error in generateResponse for ${detailLevel}:`, error);
    throw new Error(`Failed to generate response for ${detailLevel}`);
  }
}

async function needMoreInformation(
  query: string,
  response: string
): Promise<boolean> {
  console.log("Checking if more information is needed");
  const prompt = PromptTemplate.fromTemplate(`
    Analyze the following question and response, and determine if more detailed information is needed:

    Question: {query}
    Response: {response}

    Does this response fully answer the question, or is more detailed information required?
    Answer with 'Yes' if more information is needed, or 'No' if the response is sufficient.

    Answer:
  `);

  const chain = RunnableSequence.from([
    {
      query: (input: any) => input.query,
      response: (input: any) => input.response,
    },
    prompt,
    chatModel,
    new StringOutputParser(),
  ]);

  const result = await chain.invoke({ query, response });
  const needMore = result.toLowerCase().includes("yes");
  console.log(`Need more information: ${needMore}`);
  return needMore;
}

export async function hierarchicalRetrieval(query: string) {
  console.log(`Starting hierarchical retrieval for query: "${query}"`);

  // Step 1: Retrieve summaries (5 results)
  const summaryResults = await query_similar_content(query, 5, "summary");
  let response = await generateResponse(query, summaryResults, "summary");

  // Step 2: Check if more information is needed
  let needMore = await needMoreInformation(query, response);

  if (needMore) {
    console.log("Moving to full content level");
    // Step 3: Retrieve full sections (3 results)
    const fullResults = await query_similar_content(query, 3, "section");
    response = await generateResponse(query, fullResults, "full");
    console.log("Hierarchical retrieval complete at full level");
    return { response, ragResults: fullResults, level: "full" };
  }

  console.log("Hierarchical retrieval complete at summary level");
  return { response, ragResults: summaryResults, level: "summary" };
}
