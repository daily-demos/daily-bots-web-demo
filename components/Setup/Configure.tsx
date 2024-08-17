import React from "react";
import { ConfigOption, VoiceClientServices } from "realtime-ai";
import { useVoiceClient } from "realtime-ai-react";

import HelpTip from "../ui/helptip";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

import ConfigSelect from "./ConfigSelect";
import DeviceSelect from "./DeviceSelect";

interface ConfigureProps {
  startAudioOff: boolean;
  handleStartAudioOff: () => void;
  state: string;
}

export const Configure: React.FC<ConfigureProps> = React.memo(
  ({ startAudioOff, handleStartAudioOff, state }) => {
    const voiceClient = useVoiceClient()!;

    const updateConfig = (
      config: ConfigOption,
      services: VoiceClientServices | undefined
    ) => {
      // Update config
      const c = voiceClient.setServiceOptionInConfig("llm", config);
      voiceClient.updateConfig(c);

      // We should only update services in ready app state (not when connnected)
      // This try catch any errors if we accidently end up here
      try {
        if (services) {
          voiceClient.services = { ...voiceClient.services, ...services };
        }
      } catch (e) {
        return;
      }
    };

    return (
      <>
        <section className="flex flex-col flex-wrap gap-3 lg:gap-4">
          <DeviceSelect hideMeter={false} />
          <ConfigSelect
            state={state}
            onConfigUpdate={(config, services) =>
              updateConfig(config, services)
            }
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
