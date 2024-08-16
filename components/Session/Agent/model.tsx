import React, { useCallback } from "react";

import styles from "./styles.module.css";

const ModelBadge: React.FC = () => {
  const [model, setModel] = React.useState<string | undefined>("Unknown model");

  return <div className={styles.modelBadge}>{model}</div>;
};

export default ModelBadge;
