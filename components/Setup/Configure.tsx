import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ConfigOption,
  VoiceClientConfigOption,
  VoiceClientServices,
} from "realtime-ai";
import { useVoiceClient } from "realtime-ai-react";

import HelpTip from "../ui/helptip";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

import ConfigSelect from "./ConfigSelect";
import DeviceSelect from "./DeviceSelect";
import Prompt from "./Prompt";

interface ConfigureProps {
  startAudioOff: boolean;
  handleStartAudioOff: () => void;
  state: string;
}

export const Configure: React.FC<ConfigureProps> = React.memo(
  ({ startAudioOff, handleStartAudioOff, state }) => {
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
      (
        config: VoiceClientConfigOption[],
        services: VoiceClientServices | undefined
      ) => {
        const newConfig: VoiceClientConfigOption[] =
          voiceClient.partialToConfig(config);

        voiceClient.updateConfig(newConfig);

        // We should only update services in ready app state (not when connnected)
        // This try catch any errors if we accidently end up here
        try {
          if (services && services.llm !== voiceClient.services.llm) {
            voiceClient.services = { ...voiceClient.services, ...services };
          }
        } catch (e) {
          return;
        }
      },
      [voiceClient]
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
          />
        </section>

        <section className="flex flex-col gap-4 border-y border-primary-hairline py-4 mt-4">
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
      </>
    );
  },
  (prevProps, nextProps) =>
    prevProps.startAudioOff === nextProps.startAudioOff &&
    prevProps.state === nextProps.state
);

Configure.displayName = "Configure";
