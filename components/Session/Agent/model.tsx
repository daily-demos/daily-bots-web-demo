import React, { useCallback, useEffect } from "react";
import { VoiceEvent } from "realtime-ai";
import { useVoiceClient, useVoiceClientEvent } from "realtime-ai-react";

import styles from "./styles.module.css";

const ModelBadge: React.FC = () => {
  const voiceClient = useVoiceClient();
  const [model, setModel] = React.useState<string | undefined>("Unknown model");

  const getModelFromConfig = useCallback(() => {
    voiceClient?.getServiceOptionsFromConfig("llm").options.find((option) => {
      if (option.name === "model") {
        setModel(option.value as string);
        return true;
      }
      return false;
    });
  }, [voiceClient]);

  useVoiceClientEvent(VoiceEvent.ConfigUpdated, () => {
    getModelFromConfig();
  });

  useEffect(() => {
    getModelFromConfig();
  }, [getModelFromConfig]);

  return <div className={styles.modelBadge}>{model}</div>;
};

export default ModelBadge;
