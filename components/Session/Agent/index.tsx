import React, { memo, useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { VoiceEvent } from "realtime-ai";
import { useVoiceClientEvent } from "realtime-ai-react";

import ModelBadge from "./model";
import WaveForm from "./waveform";

import styles from "./styles.module.css";

export const Agent: React.FC<{
  isReady: boolean;
  statsAggregator: StatsAggregator;
  fetchingRAG: boolean;
}> = memo(
  ({ isReady, statsAggregator, fetchingRAG = false }) => {
    const [hasStarted, setHasStarted] = useState<boolean>(false);
    const [botStatus, setBotStatus] = useState<
      "initializing" | "connected" | "disconnected"
    >("initializing");
    const [botIsTalking, setBotIsTalking] = useState<boolean>(false);

    useEffect(() => {
      // Update the started state when the transport enters the ready state
      if (!isReady) return;
      setHasStarted(true);
      setBotStatus("connected");
    }, [isReady]);

    useVoiceClientEvent(
      VoiceEvent.BotDisconnected,
      useCallback(() => {
        setHasStarted(false);
        setBotStatus("disconnected");
      }, [])
    );

    useVoiceClientEvent(
      VoiceEvent.BotStartedSpeaking,
      useCallback(() => {
        setBotIsTalking(true);
      }, [])
    );

    useVoiceClientEvent(
      VoiceEvent.BotStoppedSpeaking,
      useCallback(() => {
        setBotIsTalking(false);
      }, [])
    );

    // Cleanup
    useEffect(() => () => setHasStarted(false), []);

    const cx = clsx(
      styles.agentWindow,
      hasStarted && styles.ready,
      botIsTalking && styles.talking
    );

    return (
      <div className={styles.agent}>
        <div className={cx}>
          <ModelBadge />
          {!hasStarted ? (
            <span className={styles.loader}>
              <Loader2 size={32} className="animate-spin" />
            </span>
          ) : (
            <>
              <WaveForm isThinking={fetchingRAG} scanningSpeed={1} />
            </>
          )}
        </div>
      </div>
    );
  },
  (p, n) => p.isReady === n.isReady && p.fetchingRAG === n.fetchingRAG
);
Agent.displayName = "Agent";

export default Agent;
