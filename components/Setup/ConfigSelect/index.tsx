import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cx } from "class-variance-authority";
import { Languages } from "lucide-react";
import Image from "next/image";
import {
  VoiceClientConfigOption,
  VoiceClientServices,
  VoiceEvent,
} from "realtime-ai";
import { useVoiceClient, useVoiceClientEvent } from "realtime-ai-react";

import { AppContext } from "@/components/context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  defaultLLMPrompt,
  LANGUAGES,
  LLM_MODEL_CHOICES,
  PRESET_CHARACTERS,
} from "@/rtvi.config";
import { cn } from "@/utils/tailwind";

import Prompt from "../Prompt";
import StopSecs from "../StopSecs";

type CharacterData = {
  name: string;
  prompt: string;
  voice: string;
};

interface ConfigSelectProps {
  state: string;
  onConfigUpdate: (
    config: VoiceClientConfigOption[],
    services?: VoiceClientServices
  ) => void;
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
  state,
  inSession = false,
}) => {
  const voiceClient = useVoiceClient();
  const { character, setCharacter, language, setLanguage } =
    useContext(AppContext);
  const [llmProvider, setLlmProvider] = useState<string>();
  const [llmModel, setLlmModel] = useState<string>();
  const [vadStopSecs, setVadStopSecs] = useState<number>();
  const [bufferedCharacter, setBufferedCharacter] = useState<number>(character);
  const [showPrompt, setshowPrompt] = useState<boolean>(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  useVoiceClientEvent(
    VoiceEvent.ConfigUpdated,
    useCallback(() => {
      setCharacter(bufferedCharacter);
    }, [bufferedCharacter, setCharacter])
  );

  useEffect(() => {
    // Modal effect
    // Note: backdrop doesn't currently work with dialog open, so we use setModal instead
    const current = modalRef.current;

    if (current && showPrompt) {
      current.inert = true;
      current.showModal();
      current.inert = false;
    }
    return () => current?.close();
  }, [showPrompt]);

  // Assign default values from client config
  useEffect(() => {
    if (!voiceClient) return;

    // Get the current llm provider and model
    setLlmProvider(voiceClient.services.llm ?? llmProviders[0].value);

    // Get the current config llm model
    setLlmModel(
      voiceClient.getServiceOptionValueFromConfig("llm", "model") as string
    );

    // Get the current config vad stop secs
    setVadStopSecs(
      (
        voiceClient.getServiceOptionValueFromConfig("vad", "params") as {
          stop_secs: number;
        }
      ).stop_secs
    );
  }, [voiceClient]);

  // Update the config options when the character changes
  useEffect(() => {
    if (!llmModel || !llmProvider || !vadStopSecs || !voiceClient) return;

    // Get character data
    const characterData = PRESET_CHARACTERS[bufferedCharacter] as CharacterData;

    // Compose new config object
    const updatedConfig: VoiceClientConfigOption[] =
      voiceClient.setConfigOptions([
        {
          service: "vad",
          options: [{ name: "params", value: { stop_secs: vadStopSecs } }],
        },
        {
          service: "tts",
          options: [
            {
              name: "voice",
              value:
                language !== 0
                  ? LANGUAGES[language].default_voice
                  : characterData.voice,
            },
            {
              name: "model",
              value: LANGUAGES[language].tts_model,
            },
            {
              name: "language",
              value: LANGUAGES[language].value,
            },
          ],
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
                  content:
                    language !== 0
                      ? defaultLLMPrompt +
                        `\nRespond only in ${LANGUAGES[language].label} please.`
                          .split("\n")
                          .map((line) => line.trim())
                          .join("\n")
                      : characterData.prompt
                          .split("\n")
                          .map((line) => line.trim())
                          .join("\n"),
                },
              ],
            },
          ],
        },
        {
          service: "stt",
          options: [
            {
              name: "model",
              value: LANGUAGES[language].stt_model,
            },
            {
              name: "language",
              value: LANGUAGES[language].value,
            },
          ],
        },
      ]);

    onConfigUpdate(updatedConfig, { llm: llmProvider });
  }, [
    llmProvider,
    llmModel,
    language,
    voiceClient,
    onConfigUpdate,
    bufferedCharacter,
    vadStopSecs,
  ]);

  const availableModels = LLM_MODEL_CHOICES.find(
    (choice) => choice.value === llmProvider
  )?.models;

  return (
    <>
      <dialog ref={modalRef}>
        <Prompt
          characterPrompt={PRESET_CHARACTERS[bufferedCharacter].prompt}
          handleUpdate={(prompt) => {
            if (!voiceClient) return;
            const newConfig = voiceClient.setServiceOptionInConfig("llm", {
              name: inSession ? "messages" : "initial_messages",
              value: prompt,
            });

            onConfigUpdate(newConfig);
          }}
          handleClose={() => setshowPrompt(false)}
        />
      </dialog>
      <div className="flex flex-col flex-wrap gap-4">
        <Field label="Language" error={false}>
          <Select
            onChange={(e) => setLanguage(parseInt(e.currentTarget.value))}
            value={language}
            icon={<Languages size={24} />}
          >
            {LANGUAGES.map((lang, i) => (
              <option key={lang.label} value={i}>
                {lang.label}
              </option>
            ))}
          </Select>
        </Field>
        <Accordion type="single" collapsible>
          {language === 0 && (
            <AccordionItem value="character">
              <AccordionTrigger>Character</AccordionTrigger>
              <AccordionContent>
                <Field error={false}>
                  <div className="w-full flex flex-col md:flex-row gap-2">
                    <Select
                      disabled={inSession && !["ready", "idle"].includes(state)}
                      className="flex-1"
                      value={bufferedCharacter}
                      onChange={(e) =>
                        setBufferedCharacter(parseInt(e.currentTarget.value))
                      }
                    >
                      {PRESET_CHARACTERS.map(({ name }, i) => (
                        <option key={`char-${i}`} value={i}>
                          {name}
                        </option>
                      ))}
                    </Select>
                    <Button variant="light" onClick={() => setshowPrompt(true)}>
                      Customize
                    </Button>
                  </div>
                </Field>
              </AccordionContent>
            </AccordionItem>
          )}
          <AccordionItem value="llm">
            <AccordionTrigger>LLM options</AccordionTrigger>
            <AccordionContent>
              <Field error={false}>
                {!inSession && (
                  <>
                    <Label>Provider</Label>
                    <div className="flex flex-row gap-2">
                      {llmProviders.map(({ value, label }) => (
                        <div
                          tabIndex={0}
                          className={cn(
                            tileCX,
                            value === llmProvider && tileActiveCX
                          )}
                          key={value}
                          onClick={() => {
                            if (!["ready", "idle"].includes(state)) return;

                            setLlmProvider(value);
                            setLlmModel(
                              llmProviders.find((p) => p.value === value)
                                ?.models[0].value!
                            );
                          }}
                        >
                          <Image
                            src={`/logo-${value}.svg`}
                            alt={label}
                            width="200"
                            height="60"
                            className="user-select-none pointer-events-none"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <Label>Model</Label>
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
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="voice">
            <AccordionTrigger>Voice config</AccordionTrigger>
            <AccordionContent>
              <StopSecs
                vadStopSecs={vadStopSecs}
                handleChange={(v) => {
                  setVadStopSecs(v[0]);
                }}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
};

export default ConfigSelect;
