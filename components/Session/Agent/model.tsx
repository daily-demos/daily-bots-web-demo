import React, { useCallback } from "react";
import { VoiceEvent } from "realtime-ai";
import { useVoiceClientEvent } from "realtime-ai-react";

import styles from "./styles.module.css";

const ModelBadge: React.FC = () => {
  //const { config } = useVoiceClient()!;
  const [model, setModel] = React.useState<string | undefined>("Unknown model");

  useVoiceClientEvent(
    VoiceEvent.ConfigUpdated,
    useCallback((e: unknown) => {
      setModel("Unknown model");
    }, [])
  );

  return <div className={styles.modelBadge}>{model}</div>;
};

export default ModelBadge;
