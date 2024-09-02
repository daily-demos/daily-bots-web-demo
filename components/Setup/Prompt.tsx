import React, { useEffect, useState } from "react";
import { LLMContextMessage, LLMHelper, VoiceEvent } from "realtime-ai";
import { useVoiceClient, useVoiceClientEvent } from "realtime-ai-react";

import { Button } from "../ui/button";
import * as Card from "../ui/card";
import { Textarea } from "../ui/textarea";

type PromptProps = {
  handleClose: () => void;
};

const Prompt: React.FC<PromptProps> = ({ handleClose }) => {
  const voiceClient = useVoiceClient()!;
  const [prompt, setPrompt] = useState<LLMContextMessage[] | undefined>(
    undefined
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  useEffect(() => {
    console.log("B");
    const p = voiceClient.getServiceOptionValueFromConfig(
      "llm",
      "initial_messages"
    ) as LLMContextMessage[] | undefined;

    if (!p || !p.length) return;

    setPrompt(p);
  }, [voiceClient]);

  useVoiceClientEvent(VoiceEvent.ConfigUpdated, async () => {
    const llmHelper = voiceClient.getHelper("llm") as LLMHelper;
    const p: LLMContextMessage[] = await llmHelper.getContext();

    console.log("A", p);
    setPrompt(p);
  });

  async function save() {
    if (!voiceClient) return;

    const llmHelper = voiceClient.getHelper("llm") as LLMHelper;
    await llmHelper.setContext({ messages: prompt }, true);

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
                value={message.content}
                rows={prompt?.length <= 1 ? 10 : 5}
                onChange={(e) => updateContextMessage(i, e.currentTarget.value)}
                className="text-sm w-full whitespace-pre-wrap"
              />
            </div>
          ))}
        </div>
      </Card.CardContent>
      <Card.CardFooter isButtonArray>
        <Button onClick={handleClose}>Close</Button>
        <Button
          variant={hasUnsavedChanges ? "success" : "outline"}
          onClick={() => {
            save();
            handleClose();
          }}
          disabled={!hasUnsavedChanges}
        >
          Update
        </Button>
      </Card.CardFooter>
    </Card.Card>
  );
};

export default Prompt;
