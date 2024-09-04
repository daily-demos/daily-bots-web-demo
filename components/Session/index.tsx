import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LineChart, LogOut, Settings, StopCircle } from "lucide-react";
import Image from "next/image";
import {
  FunctionCallParams,
  LLMHelper,
  PipecatMetrics,
  TransportState,
  VoiceEvent,
} from "realtime-ai";
import { useVoiceClient, useVoiceClientEvent } from "realtime-ai-react";

import StatsAggregator from "../../utils/stats_aggregator";
import Configuration from "../Configuration";
import Stats from "../Stats";
import { Button } from "../ui/button";
import * as Card from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import UserMicBubble from "../UserMicBubble";

import Agent from "./Agent";

let stats_aggregator: StatsAggregator;

interface SessionProps {
  state: TransportState;
  onLeave: () => void;
  openMic?: boolean;
  startAudioOff?: boolean;
}

export const Session = React.memo(
  ({ state, onLeave, startAudioOff = false }: SessionProps) => {
    const voiceClient = useVoiceClient()!;
    const [hasStarted, setHasStarted] = useState(false);
    const [showDevices, setShowDevices] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [muted, setMuted] = useState(startAudioOff);
    const modalRef = useRef<HTMLDialogElement>(null);

    // ---- Voice Client Events

    // Wait for the bot to enter a ready state and trigger it to say hello
    /*useVoiceClientEvent(
      VoiceEvent.BotReady,
      useCallback(() => {
        voiceClient.appendLLMContext({
          role: "assistant",
          content: "Greet the user",
        });
      }, [voiceClient])
    );*/

    useVoiceClientEvent(
      VoiceEvent.Metrics,
      useCallback((metrics: PipecatMetrics) => {
        metrics?.ttfb?.map((m: { processor: string; value: number }) => {
          stats_aggregator.addStat([m.processor, "ttfb", m.value, Date.now()]);
        });
      }, [])
    );

    useVoiceClientEvent(
      VoiceEvent.BotStoppedSpeaking,
      useCallback(() => {
        if (hasStarted) return;
        setHasStarted(true);
      }, [hasStarted])
    );

    const [imageUrl, setImageUrl] = useState<string | null>(null);

    (voiceClient.getHelper("llm") as LLMHelper).handleFunctionCall(
      async (fn: FunctionCallParams) => {
        console.log("Function: ", { fn });

        type Word = {
          word: string;
          imageUrl: string;
        };

        const words: Word[] = [
          {
            word: "apple",
            imageUrl:
              "https://plus.unsplash.com/premium_photo-1668772704261-b11d89a92bad?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
          {
            word: "book",
            imageUrl:
              "https://plus.unsplash.com/premium_photo-1669652639337-c513cc42ead6?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
          {
            word: "car",
            imageUrl:
              "https://plus.unsplash.com/premium_photo-1664303847960-586318f59035?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
          },
        ];

        // Get a random element from the words array
        const randomWord = words[Math.floor(Math.random() * words.length)];

        setImageUrl(randomWord.imageUrl);

        return {
          word: randomWord.word,
        };
      }
    );

    // ---- Effects

    useEffect(() => {
      // Reset started state on mount
      setHasStarted(false);
    }, []);

    useEffect(() => {
      // If we joined unmuted, enable the mic once in ready state
      if (!hasStarted || startAudioOff) return;
      voiceClient.enableMic(true);
    }, [voiceClient, startAudioOff, hasStarted]);

    useEffect(() => {
      // Create new stats aggregator on mount (removes stats from previous session)
      stats_aggregator = new StatsAggregator();
    }, []);

    useEffect(() => {
      // Leave the meeting if there is an error
      if (state === "error") {
        onLeave();
      }
    }, [state, onLeave]);

    useEffect(() => {
      // Modal effect
      // Note: backdrop doesn't currently work with dialog open, so we use setModal instead
      const current = modalRef.current;

      if (current && showDevices) {
        current.inert = true;
        current.showModal();
        current.inert = false;
      }
      return () => current?.close();
    }, [showDevices]);

    function toggleMute() {
      voiceClient.enableMic(muted);
      setMuted(!muted);
    }

    return (
      <>
        <dialog ref={modalRef}>
          <Card.Card className="w-svw max-w-full md:max-w-md">
            <Card.CardHeader>
              <Card.CardTitle>Configuration</Card.CardTitle>
            </Card.CardHeader>
            <Card.CardContent>
              <Configuration showAllOptions={true} />
            </Card.CardContent>
            <Card.CardFooter>
              <Button onClick={() => setShowDevices(false)}>Close</Button>
            </Card.CardFooter>
          </Card.Card>
        </dialog>

        {showStats &&
          createPortal(
            <Stats
              statsAggregator={stats_aggregator}
              handleClose={() => setShowStats(false)}
            />,
            document.getElementById("tray")!
          )}

        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {/* <Card.Card
            fullWidthMobile={false}
            className="w-full max-w-[320px] sm:max-w-[420px] mt-auto shadow-long"
          >
            <Agent
              isReady={state === "ready"}
              statsAggregator={stats_aggregator}
            />
          </Card.Card> */}
          <Card.Card
            fullWidthMobile={false}
            className="w-full max-w-[320px] sm:max-w-[420px] mt-auto shadow-long"
          >
            {imageUrl && (
              // <Image src={imageUrl} alt="apple" width={320} height={320} />
              <img src={imageUrl} alt="apple" />
            )}
          </Card.Card>
          <UserMicBubble
            active={hasStarted}
            muted={muted}
            handleMute={() => toggleMute()}
          />
        </div>

        <footer className="w-full flex flex-row mt-auto self-end md:w-auto">
          <div className="flex flex-row justify-between gap-3 w-full md:w-auto">
            <Tooltip>
              <TooltipContent>Interrupt bot</TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  //onClick={() => voiceClient.interrupt()}
                >
                  <StopCircle />
                </Button>
              </TooltipTrigger>
            </Tooltip>

            <Tooltip>
              <TooltipContent>Show bot statistics panel</TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  variant={showStats ? "light" : "ghost"}
                  size="icon"
                  onClick={() => setShowStats(!showStats)}
                >
                  <LineChart />
                </Button>
              </TooltipTrigger>
            </Tooltip>
            <Tooltip>
              <TooltipContent>Configure</TooltipContent>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDevices(true)}
                >
                  <Settings />
                </Button>
              </TooltipTrigger>
            </Tooltip>
            <Button onClick={() => onLeave()} className="ml-auto">
              <LogOut size={16} />
              End
            </Button>
          </div>
        </footer>
      </>
    );
  },
  (p, n) => p.state === n.state
);

Session.displayName = "Session";

export default Session;
