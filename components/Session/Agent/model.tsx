import React from "react";
import { RTVIEvent } from "realtime-ai";
import { useRTVIClient, useRTVIClientEvent } from "realtime-ai-react";

import styles from "./styles.module.css";

const ModelBadge: React.FC = () => {
  const voiceClient = useRTVIClient()!;
  const [model, setModel] = React.useState<string | undefined>(undefined);

  const getModelFromConfig = async () => {
    if (!voiceClient || voiceClient.state !== "ready") return;

    const model = (await voiceClient.getServiceOptionValueFromConfig(
      "llm",
      "model"
    )) as string;

    setModel(model);
  };

  useRTVIClientEvent(RTVIEvent.Config, () => {
    getModelFromConfig();
  });

  return <div className={styles.modelBadge}>{model}</div>;
};

export default ModelBadge;
