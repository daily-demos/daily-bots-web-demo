import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  LineChart,
  LogOut,
  Settings,
  StopCircle,
} from "lucide-react";
import { PipecatMetrics, TransportState, VoiceEvent } from "realtime-ai";
import { useVoiceClient, useVoiceClientEvent } from "realtime-ai-react";

import StatsAggregator from "../../utils/stats_aggregator";
import { Configure } from "../Setup";
import { Button } from "../ui/button";
import * as Card from "../ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

import Agent from "./Agent";
import RAGStatsDrawer from "./RAGStatsDrawer";
import Stats from "./Stats";
import UserMicBubble from "./UserMicBubble";

let stats_aggregator: StatsAggregator;

interface SessionProps {
  state: TransportState;
  onLeave: () => void;
  openMic?: boolean;
  startAudioOff?: boolean;
  fetchingRAG: boolean;
  ragStats?: any;
}

interface RAGStatsHistory {
  queryTimes: number[];
  responseTimes: number[];
  totalTimes: number[];
}

export const Session = ({
  state,
  onLeave,
  startAudioOff = false,
  fetchingRAG = false,
  ragStats,
}: SessionProps) => {
  const voiceClient = useVoiceClient()!;
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [showDevices, setShowDevices] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showRAGStats, setShowRAGStats] = useState<boolean>(false);
  const [ragStatsHistory, setRagStatsHistory] = useState<RAGStatsHistory>({
    queryTimes: [],
    responseTimes: [],
    totalTimes: [],
  });
  const [muted, setMuted] = useState(startAudioOff);
  const modalRef = useRef<HTMLDialogElement>(null);
  const [cumulativeTokens, setCumulativeTokens] = useState({
    input: 0,
    output: 0,
  });

  // ---- Voice Client Events

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

  // Open drawer when first RAG stats are received
  useEffect(() => {
    if (ragStats && !showRAGStats) {
      setShowRAGStats(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ragStats]);

  // Update RAG stats history when new stats are received
  useEffect(() => {
    if (ragStats) {
      setRagStatsHistory((prev) => ({
        queryTimes: [
          ...prev.queryTimes,
          ragStats.querySimilarContentTime,
        ].slice(-20),
        responseTimes: [
          ...prev.responseTimes,
          ragStats.generateResponseTime,
        ].slice(-20),
        totalTimes: [...prev.totalTimes, ragStats.totalRAGTime].slice(-20),
      }));

      setCumulativeTokens((prev) => ({
        input: prev.input + ragStats.tokenUsage.promptTokens,
        output: prev.output + ragStats.tokenUsage.completionTokens,
      }));
    }
  }, [ragStats]);

  const toggleMute = useCallback(() => {
    voiceClient.enableMic(muted);
    setMuted((prev) => !prev);
  }, [voiceClient, muted]);

  return (
    <>
      <dialog ref={modalRef}>
        <Card.Card className="w-svw max-w-full md:max-w-md lg:max-w-lg">
          <Card.CardHeader>
            <Card.CardTitle>Configuration</Card.CardTitle>
          </Card.CardHeader>
          <Card.CardContent>
            <Configure state={state} inSession={true} />
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

      {showRAGStats &&
        ragStats &&
        createPortal(
          <RAGStatsDrawer
            ragStats={ragStats}
            cumulativeTokens={cumulativeTokens}
            handleClose={() => setShowRAGStats(false)}
          />,
          document.getElementById("tray")!
        )}

      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <Card.Card
          fullWidthMobile={false}
          className="w-full max-w-[320px] sm:max-w-[420px] mt-auto shadow-long"
        >
          <Agent
            isReady={state === "ready"}
            fetchingRAG={fetchingRAG}
            statsAggregator={stats_aggregator}
          />
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
                onClick={() => {
                  voiceClient.action({
                    service: "tts",
                    action: "interrupt",
                    arguments: [],
                  });
                }}
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
            <TooltipContent>Show RAG statistics</TooltipContent>
            <TooltipTrigger asChild>
              <Button
                variant={showRAGStats ? "light" : "ghost"}
                size="icon"
                onClick={() => setShowRAGStats((prev) => !prev)}
              >
                <FileText />
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
};

Session.displayName = "Session";

export default Session;
