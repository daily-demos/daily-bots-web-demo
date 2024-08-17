import React, { useEffect, useState } from "react";
import { Mic } from "lucide-react";
import { ConfigOption, VoiceClientServices } from "realtime-ai";

import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { LLM_MODEL_CHOICES } from "@/rtvi.config";

interface ConfigSelectProps {
  state: string;
  onConfigUpdate: (config: ConfigOption, services: VoiceClientServices) => void;
}

const llmProviders = LLM_MODEL_CHOICES.map((choice) => ({
  label: choice.label,
  value: choice.value,
  models: choice.models,
}));

export const ConfigSelect: React.FC<ConfigSelectProps> = ({
  onConfigUpdate,
  state,
}) => {
  const [llmProvider, setLlmProvider] = useState<string>(llmProviders[0].value);
  const [llmModel, setLlmModel] = useState<string>(
    llmProviders[0].models[0].value
  );

  useEffect(() => {
    const config: ConfigOption = { name: "model", value: llmModel };

    onConfigUpdate(config, { llm: llmProvider });
  }, [llmProvider, llmModel, onConfigUpdate]);

  const availableModels = LLM_MODEL_CHOICES.find(
    (choice) => choice.value === llmProvider
  )?.models;

  return (
    <div className="flex flex-col flex-wrap gap-4">
      <Field label="LLM Config:" error={false}>
        <Select
          disabled={!["ready", "idle"].includes(state)}
          onChange={(e) => {
            setLlmProvider(e.currentTarget.value);
            setLlmModel(
              llmProviders.find((p) => p.value === e.currentTarget.value)
                ?.models[0].value!
            );
          }}
          value={llmProvider}
          icon={<Mic size={24} />}
        >
          {llmProviders.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Select
          onChange={(e) => setLlmModel(e.currentTarget.value)}
          value={llmModel}
          icon={<Mic size={24} />}
        >
          {availableModels?.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
};

export default ConfigSelect;
