import React, { useEffect, useState } from "react";
import { LLMContextMessage } from "realtime-ai";
import { useRTVIClient } from "realtime-ai-react";

import { Button } from "../ui/button";
import * as Card from "../ui/card";
import { Textarea } from "../ui/textarea";

type PromptProps = {
  handleUpdate: (context: LLMContextMessage[]) => void;
  handleClose: () => void;
  characterPrompt?: string;
};

const Prompt: React.FC<PromptProps> = ({
  handleUpdate,
  handleClose,
  characterPrompt,
}) => {
  const voiceClient = useRTVIClient()!;
  const [prompt, setPrompt] = useState<LLMContextMessage[] | undefined>(
    undefined
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  useEffect(() => {
    if (!characterPrompt) return;

    setPrompt([
      {
        role: "system",
        content: characterPrompt
          .split("\n")
          .map((line) => line.trim())
          .join("\n"),
      },
    ]);
  }, [characterPrompt]);

  function save() {
    if (!voiceClient || !prompt) return;

    handleUpdate(prompt);

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
                value={message.content as string}
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
