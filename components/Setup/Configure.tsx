import React, { useCallback, useEffect, useRef, useState } from "react";
import { VoiceClientConfigOption, VoiceClientServices } from "realtime-ai";
import { useVoiceClient } from "realtime-ai-react";

import HelpTip from "../ui/helptip";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

import ConfigSelect from "./ConfigSelect";
import DeviceSelect from "./DeviceSelect";
import Prompt from "./Prompt";

interface ConfigureProps {
  state: string;
  startAudioOff?: boolean;
  inSession?: boolean;
  handleStartAudioOff?: () => void;
  handleConfigUpdate?: (config: VoiceClientConfigOption[]) => void;
}

export const Configure: React.FC<ConfigureProps> = React.memo(
  ({
    startAudioOff,
    state,
    inSession = false,
    handleStartAudioOff,
    handleConfigUpdate,
  }) => {
    const voiceClient = useVoiceClient()!;
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

    const updateConfig = useCallback(
      async (
        config: VoiceClientConfigOption[],
        services: VoiceClientServices | undefined
      ) => {
        const newConfig: VoiceClientConfigOption[] =
          voiceClient.partialToConfig(config);

        if (inSession) {
          handleConfigUpdate?.(newConfig);
          return;
        }

        try {
          if (services && services.llm !== voiceClient.services.llm) {
            voiceClient.services = { ...voiceClient.services, ...services };
          }
        } catch (e) {
          return;
        }

        console.log("CONFIG HANDLER", newConfig);

        voiceClient.updateConfig(newConfig);
      },
      [voiceClient, inSession, handleConfigUpdate]
    );

    return (
      <>
        <dialog ref={modalRef}>
          <Prompt handleClose={() => setshowPrompt(false)} />
        </dialog>

        <section className="flex flex-col flex-wrap gap-3 lg:gap-4">
          <DeviceSelect hideMeter={false} />
          <ConfigSelect
            state={state}
            onModifyPrompt={() => setshowPrompt(true)}
            onConfigUpdate={updateConfig}
            inSession={inSession}
          />
        </section>

        {!inSession && (
          <section className="flex flex-col gap-4 border-y border-primary-hairline py-4">
            <div className="flex flex-row justify-between items-center">
              <Label className="flex flex-row gap-1 items-center">
                Join with mic muted{" "}
                <HelpTip text="Start with microphone muted (click to unmute)" />
              </Label>
              <Switch
                checked={startAudioOff}
                onCheckedChange={handleStartAudioOff}
              />
            </div>
          </section>
        )}
      </>
    );
  },
  (prevProps, nextProps) =>
    prevProps.startAudioOff === nextProps.startAudioOff &&
    prevProps.state === nextProps.state
);

Configure.displayName = "Configure";
