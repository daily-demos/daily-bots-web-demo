"use client";

import { useEffect, useRef, useState } from "react";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { FunctionCallParams, LLMHelper } from "realtime-ai";
import { DailyVoiceClient } from "realtime-ai-daily";
import { VoiceClientAudio, VoiceClientProvider } from "realtime-ai-react";

import App from "@/components/App";
import { CharacterProvider } from "@/components/context";
import Header from "@/components/Header";
import Splash from "@/components/Splash";
import {
  BOT_READY_TIMEOUT,
  defaultConfig,
  defaultServices,
} from "@/rtvi.config";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [fetchingRAG, setFetchingRAG] = useState(false);
  const voiceClientRef = useRef<DailyVoiceClient | null>(null);

  useEffect(() => {
    if (!showSplash || voiceClientRef.current) {
      return;
    }

    const voiceClient = new DailyVoiceClient({
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "/api",
      services: defaultServices,
      config: defaultConfig,
      timeout: BOT_READY_TIMEOUT,
    });

    const llmHelper = new LLMHelper({
      callbacks: {
        onLLMFunctionCall: (fn) => {
          setFetchingRAG(true);
        },
      },
    });
    voiceClient.registerHelper("llm", llmHelper);

    llmHelper.handleFunctionCall(async (fn: FunctionCallParams) => {
      const args = fn.arguments as any;
      try {
        if (fn.functionName === "get_rag_context" && args.query) {
          console.log("get_rag_context", args.query);
          setFetchingRAG(true);

          const response = await fetch("/api/rag", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: args.query }),
          });

          if (!response.ok) {
            setFetchingRAG(false);
            throw new Error("Failed to fetch RAG context");
          }

          const data = await response.json();
          setFetchingRAG(false);

          console.log(data);

          const formattedContext = `
            Relevant Context:
            ${data.ragResults
              .map(
                (result: any) =>
                  `Title: ${result.metadata.title}
                   Content: ${result.metadata.content}`
              )
              .join("\n\n")}
    
            AI Response:
            ${data.llmResponse}
          `;

          return { context: formattedContext };
        } else {
          setFetchingRAG(false);
          return { error: "Invalid function call or missing query" };
        }
      } catch (error) {
        console.error("Error fetching RAG context:", error);
        setFetchingRAG(false);
        return { error: "Couldn't fetch RAG context" };
      }
    });

    voiceClientRef.current = voiceClient;
  }, [showSplash]);

  if (showSplash) {
    return <Splash handleReady={() => setShowSplash(false)} />;
  }

  return (
    <VoiceClientProvider voiceClient={voiceClientRef.current!}>
      <CharacterProvider>
        <TooltipProvider>
          <main>
            <Header />
            <div id="app">
              <App fetchingRAG={fetchingRAG} />
            </div>
          </main>
          <aside id="tray" />
        </TooltipProvider>
      </CharacterProvider>
      <VoiceClientAudio />
    </VoiceClientProvider>
  );
}
