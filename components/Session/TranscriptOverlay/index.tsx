import React, { useCallback, useEffect, useRef, useState } from "react";
import { VoiceEvent } from "realtime-ai";
import { useVoiceClientEvent } from "realtime-ai-react";

import styles from "./styles.module.css";

const TranscriptOverlay: React.FC = () => {
  const [sentences, setSentences] = useState<string[]>([]);
  const [sentencesBuffer, setSentencesBuffer] = useState<string[]>([]);
  const displayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useVoiceClientEvent(
    VoiceEvent.BotTranscript,
    useCallback((text: string) => {
      setSentencesBuffer((s) => [...s, text.trim()]);
    }, [])
  );

  useEffect(() => {
    if (sentencesBuffer.length > 0) {
      const interval = 1000 * sentences.length;
      displayIntervalRef.current = setTimeout(() => {
        setSentences((s) => [...s, sentencesBuffer[0]]);
        setSentencesBuffer((s) => s.slice(1));
      }, interval);
    }
    return () => {
      if (displayIntervalRef.current) {
        clearInterval(displayIntervalRef.current);
      }
    };
  }, [sentencesBuffer, sentences]);

  return (
    <div className={styles.container}>
      {sentences.map((sentence, index) => (
        <abbr
          key={index}
          className={`${styles.transcript} ${styles.sentence}`}
          onAnimationEnd={() => setSentences((s) => s.slice(1))}
        >
          <span>{sentence}</span>
        </abbr>
      ))}
    </div>
  );
};

export default TranscriptOverlay;
