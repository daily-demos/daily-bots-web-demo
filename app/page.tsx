"use client";

import App from "@/components/App";
import Splash from "@/components/Splash";

import {
  defaultServices,
  defaultConfig,
  BOT_READY_TIMEOUT,
  Voice,
} from "@/rtvi.config";
import { VoiceClientAudio, VoiceClientProvider } from "realtime-ai-react";
import { DailyVoiceClient } from "realtime-ai-daily";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const voiceClientRef = useRef<DailyVoiceClient | null>(null);

  useEffect(() => {
    if (voiceClientRef.current) {
      return;
    }

    const voiceClient = new DailyVoiceClient({
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "/api",
      services: defaultServices,
      config: defaultConfig,
      enableMic: true,
      timeout: BOT_READY_TIMEOUT,
    });

    voiceClientRef.current = voiceClient;
  }, []);

  return (
    <VoiceClientProvider voiceClient={voiceClientRef.current!}>
      <TooltipProvider>
        <main>
          {showSplash ? (
            <Splash handleReady={() => setShowSplash(false)} />
          ) : (
            <div id="app">
              <App />
            </div>
          )}
        </main>
        <aside id="tray" />
      </TooltipProvider>
      <VoiceClientAudio />
    </VoiceClientProvider>
  );
}
