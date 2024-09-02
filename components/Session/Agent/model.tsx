import React from "react";
import { VoiceEvent } from "realtime-ai";
import { useVoiceClient, useVoiceClientEvent } from "realtime-ai-react";

import styles from "./styles.module.css";

const ModelBadge: React.FC = () => {
  const voiceClient = useVoiceClient()!;
  const [model, setModel] = React.useState<string | undefined>(undefined);

  const getModelFromConfig = () => {
    if (!voiceClient) return;

    setModel(
      voiceClient.getServiceOptionValueFromConfig("llm", "model") as string
    );
  };

  useVoiceClientEvent(VoiceEvent.ConfigUpdated, () => {
    if (!voiceClient) return;
    getModelFromConfig();
  });

  return <div className={styles.modelBadge}>{model}</div>;
};

export default ModelBadge;
