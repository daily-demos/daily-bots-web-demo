import React, { useCallback, useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { RTVIEvent } from "realtime-ai";
import { useRTVIClient, useRTVIClientEvent } from "realtime-ai-react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/tailwind";

import styles from "./styles.module.css";

const ExpiryTimer: React.FC = () => {
  const voiceClient = useRTVIClient();
  const [exp, setExp] = useState<number | undefined>(undefined);
  const [time, setTime] = useState({ minutes: 0, seconds: 0 });

  useRTVIClientEvent(
    RTVIEvent.Connected,
    useCallback(() => setExp(voiceClient?.transportExpiry), [voiceClient])
  );

  useRTVIClientEvent(
    RTVIEvent.Disconnected,
    useCallback(() => {
      setExp(undefined);
      setTime({ minutes: 0, seconds: 0 });
    }, [])
  );

  const noExpiry = !exp || exp === 0;

  useEffect(() => {
    if (noExpiry) return;

    const futureTimestamp = exp;

    // Function to update time
    const updateTime = () => {
      if (noExpiry) clearInterval(interval);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const differenceInSeconds = futureTimestamp! - currentTimestamp;
      const minutes = Math.floor(differenceInSeconds / 60);
      const seconds = differenceInSeconds % 60;
      setTime({ minutes, seconds });
    };

    // Update time every second
    const interval = setInterval(updateTime, 1000);

    // Initial update
    updateTime();

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, [noExpiry, exp]);

  if (noExpiry) return null;

  const isExpired = time.minutes <= 0 && time.seconds <= 0;

  return (
    <Tooltip>
      <TooltipTrigger>
        <div className={styles.expiry}>
          <Timer size={20} />
          <span className={cn(styles.time, isExpired && styles.expired)}>
            {isExpired
              ? "--:--"
              : `${time.minutes}m ${time.seconds.toString().padStart(2, "0")}s`}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Remaining session time before expiry</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ExpiryTimer;
