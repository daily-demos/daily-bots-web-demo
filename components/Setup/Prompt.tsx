import React, { useState } from "react";
import {
  ConfigOption,
  LLMContextMessage,
  VoiceClientConfigOption,
} from "realtime-ai";
import { useVoiceClient } from "realtime-ai-react";

import { defaultConfig } from "@/rtvi.config";

import { Button } from "../ui/button";
import * as Card from "../ui/card";
import { Textarea } from "../ui/textarea";

type PromptProps = {
  handleClose: () => void;
};

const defaultPrompt: LLMContextMessage[] | undefined = defaultConfig
  .find((c: VoiceClientConfigOption) => c.service === "llm")
  ?.options?.find((o: ConfigOption) => o.name === "initial_messages")?.value as
  | LLMContextMessage[]
  | undefined;

const Prompt: React.FC<PromptProps> = ({ handleClose }) => {
  const voiceClient = useVoiceClient()!;
  const [prompt, setPrompt] = useState<LLMContextMessage[] | undefined>(
    defaultPrompt
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  function save() {
    if (!voiceClient) return;

    voiceClient.setServiceOptionInConfig("llm", {
      name: "initial_messages",
      value: prompt,
    });

    setHasUnsavedChanges(false);
  }

  const updateContextMessage = (index: number, content: string) => {
    setPrompt((prev) => {
      if (!prev) return prev;
      const newPrompt = [...prev];
      newPrompt[index].content = content;
      return newPrompt;
    });
    setHasUnsavedChanges(true);
  };

  return (
    <Card.Card className="w-svw max-w-full md:max-w-md lg:max-w-lg">
      <Card.CardHeader>
        <Card.CardTitle>LLM Prompt</Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent>
        <div className="flex flex-col gap-3">
          {prompt?.map((message, i) => (
            <div key={i} className="flex flex-col gap-1 items-start">
              <span className="font-mono font-bold text-sm">
                {message.role}
              </span>
              <Textarea
                defaultValue={message.content
                  .split("\n")
                  .map((line) => line.trim())
                  .join("\n")}
                rows={prompt?.length <= 1 ? 10 : 5}
                onChange={(e) => updateContextMessage(i, e.currentTarget.value)}
                className="text-sm w-full whitespace-pre-wrap"
              />
            </div>
          ))}
        </div>
      </Card.CardContent>
      <Card.CardFooter>
        <div className="flex flex-row gap-2">
          <Button
            variant={hasUnsavedChanges ? "success" : "outline"}
            onClick={() => save()}
            disabled={!hasUnsavedChanges}
          >
            Update
          </Button>
          <Button onClick={handleClose}>Close</Button>
        </div>
      </Card.CardFooter>
    </Card.Card>
  );
};

export default Prompt;
