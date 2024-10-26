import React, { useCallback, useContext } from "react";

import HelpTip from "../ui/helptip";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

import { RTVIClientConfigOption } from "realtime-ai";
import { useRTVIClient } from "realtime-ai-react";
import { AppContext } from "../context";
import ConfigSelect from "./ConfigSelect";
import DeviceSelect from "./DeviceSelect";

interface ConfigureProps {
  state: string;
  startAudioOff?: boolean;
  inSession?: boolean;
  handleStartAudioOff?: () => void;
}

export const Configure: React.FC<ConfigureProps> = React.memo(
  ({ startAudioOff, state, inSession = false, handleStartAudioOff }) => {
    const { clientParams, setClientParams } = useContext(AppContext);
    const voiceClient = useRTVIClient()!;

    const handleServiceUpdate = useCallback(
      (newService: { [key: string]: string }) => {
        setClientParams({ services: newService });
      },
      [setClientParams]
    );

    const handleConfigOptionUpdate = useCallback(
      async (newConfigOptions: RTVIClientConfigOption[]) => {
        const newConfig = await voiceClient.setConfigOptions(
          newConfigOptions,
          clientParams.config
        );
        setClientParams({ config: newConfig });
      },
      [voiceClient, clientParams.config, setClientParams]
    );

    return (
      <>
        <section className="flex flex-col flex-wrap gap-3 lg:gap-4">
          <DeviceSelect hideMeter={false} />
          <ConfigSelect
            state={state}
            onConfigUpdate={handleConfigOptionUpdate}
            onServiceUpdate={handleServiceUpdate}
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
