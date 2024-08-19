import React, { useEffect, useState } from "react";
import {
  ConfigOption,
  VoiceClientConfigOption,
  VoiceClientServices,
} from "realtime-ai";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { LLM_MODEL_CHOICES, PRESET_CHARACTERS } from "@/rtvi.config";

type CharacterData = {
  name: string;
  prompt: string;
  voice: string;
};

interface ConfigSelectProps {
  state: string;
  onConfigUpdate: (
    config: VoiceClientConfigOption[],
    services: VoiceClientServices
  ) => void;
  onModifyPrompt: () => void;
}

const llmProviders = LLM_MODEL_CHOICES.map((choice) => ({
  label: choice.label,
  value: choice.value,
  models: choice.models,
}));

export const ConfigSelect: React.FC<ConfigSelectProps> = ({
  onConfigUpdate,
  onModifyPrompt,
  state,
}) => {
  const [llmProvider, setLlmProvider] = useState<string>(llmProviders[0].value);
  const [llmModel, setLlmModel] = useState<string>(
    llmProviders[0].models[0].value
  );
  const [character, setCharacter] = useState<number>(0);

  useEffect(() => {
    const characterData = PRESET_CHARACTERS[character] as CharacterData;
    const updateConfigOptions: VoiceClientConfigOption[] = [
      {
        service: "tts",
        options: [{ name: "voice", value: characterData.voice }],
      },
      {
        service: "llm",
        options: [
          {
            name: "model",
            value: llmModel,
          },
          {
            name: "initial_messages",
            value: [
              {
                role: "system",
                content: characterData.prompt
                  .split("\n")
                  .map((line) => line.trim())
                  .join("\n"),
              },
            ],
          },
        ],
      },
    ];
    onConfigUpdate(updateConfigOptions, { llm: llmProvider });
  }, [llmProvider, llmModel, character, onConfigUpdate]);

  const availableModels = LLM_MODEL_CHOICES.find(
    (choice) => choice.value === llmProvider
  )?.models;

  return (
    <div className="flex flex-col flex-wrap gap-4">
      <Field label="Character preset" error={false}>
        <div className="w-full flex flex-row gap-2">
          <Select
            disabled={!["ready", "idle"].includes(state)}
            className="flex-1"
            onChange={(e) => setCharacter(parseInt(e.currentTarget.value))}
          >
            {PRESET_CHARACTERS.map(({ name }, i) => (
              <option key={`char-${i}`} value={i}>
                {name}
              </option>
            ))}
          </Select>
          <Button variant="light" onClick={onModifyPrompt}>
            Customize
          </Button>
        </div>
      </Field>
      <Field label="LLM config:" error={false}>
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
