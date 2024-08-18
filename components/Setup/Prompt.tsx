import React, { useEffect, useState } from "react";
import {
  ConfigOption,
  LLMContext,
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

  useEffect(() => {
    if (!voiceClient) return;

    const llmHelper = voiceClient.getHelper("llm") as LLMHelper;
    console.log(llmHelper.getContext());
  }, [voiceClient]);

  return (
    <Card.Card className="w-svw max-w-full md:max-w-md">
      <Card.CardHeader>
        <Card.CardTitle>LLM Prompt</Card.CardTitle>
      </Card.CardHeader>
      <Card.CardContent>
        {prompt?.map((message, i) => (
          <p key={i}>{message.content}</p>
        ))}
      </Card.CardContent>
      <Card.CardFooter>
        <Button onClick={handleClose}>Close</Button>
      </Card.CardFooter>
    </Card.Card>
  );
};

export default Prompt;
