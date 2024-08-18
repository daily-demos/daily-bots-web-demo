import React, { useState } from "react";
import {
  ConfigOption,
  LLMContextMessage,
  LLMHelper,
  VoiceClientConfigOption,
} from "realtime-ai";
import { useVoiceClient } from "realtime-ai-react";

import { defaultConfig } from "@/rtvi.config";

import { Button } from "../ui/button";
import * as Card from "../ui/card";

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

  function save() {
    if (!voiceClient) return;

    voiceClient.setServiceOptionInConfig("llm", {
      name: "initial_messages",
      value: prompt,
    });
  }

  const updateContextMessage = (index: number, content: string) => {
    setPrompt((prev) => {
      if (!prev) return prev;
      const newPrompt = [...prev];
      newPrompt[index].content = content;
      return newPrompt;
    });
  };

  return (
    <Card.Card className="w-svw max-w-full md:max-w-md">
      <Card.CardHeader>
        <Card.CardTitle>LLM Prompt</Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent>
        {prompt?.map((message, i) => (
          <div key={i}>
            <strong>{message.role}</strong>
            <textarea
              defaultValue={message.content}
              onChange={(e) => updateContextMessage(i, e.currentTarget.value)}
            />
          </div>
        ))}
      </Card.CardContent>
      <Card.CardFooter>
        <Button onClick={() => save()}>Upate</Button>
        <Button onClick={handleClose}>Close</Button>
      </Card.CardFooter>
    </Card.Card>
  );
};

export default Prompt;
