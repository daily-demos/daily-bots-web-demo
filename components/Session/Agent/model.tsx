import React, { useCallback, useEffect } from "react";
import { useVoiceClient } from "realtime-ai-react";

import styles from "./styles.module.css";

const ModelBadge: React.FC = () => {
  const voiceClient = useVoiceClient();
  const [model, setModel] = React.useState<string | undefined>("Unknown model");

  useEffect(() => {
    voiceClient?.getServiceOptionsFromConfig("llm").options.find((option) => {
      if (option.name === "model") {
        setModel(option.value as string);
        return true;
      }
      return false;
    });
  }, [voiceClient]);

  return <div className={styles.modelBadge}>{model}</div>;
};

export default ModelBadge;
