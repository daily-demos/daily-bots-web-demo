import React, { useContext, useEffect, useState } from "react";
import { cx } from "class-variance-authority";
import Image from "next/image";
import { VoiceClientConfigOption, VoiceClientServices } from "realtime-ai";
import { useVoiceClient } from "realtime-ai-react";

import { CharacterContext } from "@/components/context";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { LLM_MODEL_CHOICES, PRESET_CHARACTERS } from "@/rtvi.config";
import { cn } from "@/utils/tailwind";

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
  inSession?: boolean;
}

const llmProviders = LLM_MODEL_CHOICES.map((choice) => ({
  label: choice.label,
  value: choice.value,
  models: choice.models,
}));

const tileCX = cx(
  "*:opacity-50 cursor-pointer rounded-xl px-4 py-3 bg-white border border-primary-200 bg-white select-none ring-ring transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
);
const tileActiveCX = cx("*:opacity-100 bg-primary-100/70 border-transparent");

export const ConfigSelect: React.FC<ConfigSelectProps> = ({
  onConfigUpdate,
  onModifyPrompt,
  state,
  inSession = false,
}) => {
  const voiceClient = useVoiceClient();
  const [llmProvider, setLlmProvider] = useState<string>();
  const [llmModel, setLlmModel] = useState<string>();
  const { character, setCharacter } = useContext(CharacterContext);

  // Assign default values to llm provider and model from client config
  useEffect(() => {
    if (!voiceClient) return;

    // Get the current llm provider and model
    setLlmProvider(voiceClient?.services.llm ?? llmProviders[0].value);

    // Get the current llm model
    voiceClient.getServiceOptionsFromConfig("llm").options.find((option) => {
      if (option.name === "model") {
        setLlmModel(
          (option.value as string) ?? llmProviders[0].models[0].value
        );
      }
    });
  }, [voiceClient]);

  const availableModels = LLM_MODEL_CHOICES.find(
    (choice) => choice.value === llmProvider
  )?.models;

  return <div className="flex flex-col flex-wrap gap-4"></div>;
};

export default ConfigSelect;
