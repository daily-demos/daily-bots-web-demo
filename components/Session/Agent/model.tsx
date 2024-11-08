import React, { useContext } from "react";
import { RTVIClientConfigOption, RTVIEvent } from "realtime-ai";
import { useRTVIClientEvent } from "realtime-ai-react";

import { AppContext } from "@/components/context";
import styles from "./styles.module.css";

const ModelBadge: React.FC = () => {
  const { clientParams } = useContext(AppContext);

  const [model, setModel] = React.useState<string | undefined>(
    clientParams.config
      .find((c) => c.service === "llm")
      ?.options.find((p) => p.name === "model")?.value as string
  );

  useRTVIClientEvent(
    RTVIEvent.Config,
    async (config: RTVIClientConfigOption[]) => {
      const m = config
        .find((c) => c.service === "llm")
        ?.options.find((p) => p.name === "model")?.value as string;

      setModel(m);
    }
  );

  return <div className={styles.modelBadge}>{model}</div>;
};

export default ModelBadge;
