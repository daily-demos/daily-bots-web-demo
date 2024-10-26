import { cx } from "class-variance-authority";
import { Languages } from "lucide-react";
import Image from "next/image";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { RTVIClientConfigOption } from "realtime-ai";

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
  onServiceUpdate: (service: { [key: string]: string }) => void;
  onConfigUpdate: (configOption: RTVIClientConfigOption[]) => void;
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
  onServiceUpdate,
  state,
  inSession = false,
}) => {
  const { character, setCharacter, language, setLanguage, clientParams } =
    useContext(AppContext);

  const [llmProvider, setLlmProvider] = useState<string>(
    clientParams.services.llm
  );
  const [llmModel, setLlmModel] = useState<string>(
    clientParams.config
      .find((c) => c.service === "llm")
      ?.options.find((p) => p.name === "model")?.value as string
  );
  const [vadStopSecs, setVadStopSecs] = useState<number>(
    (
      clientParams.config
        .find((c) => c.service === "vad")
        ?.options.find((p) => p.name === "params")?.value as {
        stop_secs: number;
      }
    )?.stop_secs
  );
  const [showPrompt, setshowPrompt] = useState<boolean>(false);
  const modalRef = useRef<HTMLDialogElement>(null);

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

  const composeConfig = useCallback(
    (character: number, language: number) => {
      // Get character data
      const characterData = PRESET_CHARACTERS[character] as CharacterData;

      // Compose new config object
      const updatedConfig: RTVIClientConfigOption[] = [
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
      ];

      onConfigUpdate(updatedConfig);
    },
    [onConfigUpdate]
  );

  const availableModels = LLM_MODEL_CHOICES.find(
    (choice) => choice.value === llmProvider
  )?.models;

  return (
    <>
      <dialog ref={modalRef}>
        <Prompt
          characterPrompt={PRESET_CHARACTERS[character].prompt}
          handleUpdate={(prompt) => {
            onConfigUpdate([
              {
                service: "llm",
                options: [{ name: "initial_messages", value: prompt }],
              },
            ]);
          }}
          handleClose={() => setshowPrompt(false)}
        />
      </dialog>
      <div className="flex flex-col flex-wrap gap-4">
        <Field label="Language" error={false}>
          <Select
            onChange={(e) => {
              composeConfig(character, parseInt(e.currentTarget.value));
              setLanguage(parseInt(e.currentTarget.value));
            }}
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
                      value={character}
                      onChange={(e) => {
                        setCharacter(parseInt(e.currentTarget.value));
                        composeConfig(
                          parseInt(e.currentTarget.value),
                          language
                        );
                      }}
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
                    <div className="grid grid-cols-3 gap-2">
                      {llmProviders.map(({ value, label }) => (
                        <div
                          tabIndex={0}
                          className={cn(
                            tileCX,
                            value === llmProvider && tileActiveCX
                          )}
                          key={value}
                          onClick={() => {
                            if (value === llmProvider) return;

                            setLlmProvider(value);

                            const defaultProviderModel = llmProviders.find(
                              (p) => p.value === value
                            )?.models[0].value!;
                            setLlmModel(defaultProviderModel);

                            // Update app context
                            onServiceUpdate({ llm: value });
                            onConfigUpdate([
                              {
                                service: "llm",
                                options: [
                                  {
                                    name: "model",
                                    value: defaultProviderModel,
                                  },
                                ],
                              },
                            ]);
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
                  onChange={(e) => {
                    setLlmModel(e.currentTarget.value);
                    onConfigUpdate([
                      {
                        service: "llm",
                        options: [
                          { name: "model", value: e.currentTarget.value },
                        ],
                      },
                    ]);
                  }}
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
                  setVadStopSecs(v);

                  onConfigUpdate([
                    {
                      service: "vad",
                      options: [{ name: "params", value: { stop_secs: v } }],
                    },
                  ]);
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
