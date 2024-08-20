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
    const llmHelper = new LLMHelper({});
    voiceClient.registerHelper("llm", llmHelper);

    const serialize = (obj: any) => {
      var str = [];
      for (var p in obj)
        if (obj.hasOwnProperty(p)) {
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
      return str.join("&");
    };

    const fetchData = async (path: string, args: any) => {
      args["session_key"] = "latest";
      const query = serialize(args);
      const fullPath = `https://api.openf1.org/v1${path}?${query}`;
      const req = await fetch(fullPath);
      const resp = await req.json();
      console.log(`response is`, { resp });
      return resp;
    };

    llmHelper.handleFunctionCall(async (fn: FunctionCallParams) => {
      const args = fn.arguments as any;
      console.log({ fn });
      switch (fn.functionName) {
        case "drivers":
          const drivers = await fetchData("/drivers", args);
          return { drivers };
        case "laps":
          const laps = await fetchData("/laps", args);
          return { laps };
        case "stints":
          const stints = await fetchData("/stints", args);
          return { stints };
        case "pit":
          const pit = await fetchData("/pit", args);
          return { pit };
        case "graph":
          return {};
        default:
          return {};
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
              <App />
            </div>
          </main>
          <aside id="tray" />
        </TooltipProvider>
      </CharacterProvider>
      <VoiceClientAudio />
    </VoiceClientProvider>
  );
}
