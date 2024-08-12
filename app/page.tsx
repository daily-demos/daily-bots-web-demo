"use client";

import App from "@/components/App";
import Splash from "@/components/Splash";

import {
  defaultServices,
  defaultConfig,
  BOT_READY_TIMEOUT,
} from "@/rtvi.config";
import { VoiceClientAudio, VoiceClientProvider } from "realtime-ai-react";
import { DailyVoiceClient } from "realtime-ai-daily";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useState } from "react";

const voiceClient = new DailyVoiceClient({
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "/api",
  services: defaultServices,
  config: defaultConfig,
  enableMic: true,
  timeout: BOT_READY_TIMEOUT,
});

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <VoiceClientProvider voiceClient={voiceClient}>
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
