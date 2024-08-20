import { useEffect } from "react";
import { Mic, Webcam } from "lucide-react";
import { useVoiceClientMediaDevices } from "realtime-ai-react";

import { Field } from "../ui/field";
import { Select } from "../ui/select";

import { AudioIndicatorBar } from "./AudioIndicator";

interface DeviceSelectProps {
  hideMeter: boolean;
}

export const DeviceSelect: React.FC<DeviceSelectProps> = ({
  hideMeter = false,
}) => {
  const {
    availableMics,
    selectedMic,
    updateMic,
    availableCams,
    selectedCam,
    updateCam,
  } = useVoiceClientMediaDevices();

  useEffect(() => {
    updateMic(selectedMic?.deviceId);
    updateCam(selectedCam?.deviceId);
  }, [updateMic, selectedMic, updateCam, selectedCam]);

  return (
    <div className="flex flex-col flex-wrap gap-4">
      <Field label="Microphone" error={false}>
        <Select
          onChange={(e) => updateMic(e.currentTarget.value)}
          value={selectedMic?.deviceId}
          icon={<Mic size={24} />}
        >
          {availableMics.length === 0 ? (
            <option value="">Loading devices...</option>
          ) : (
            availableMics.map((mic) => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label}
              </option>
            ))
          )}
        </Select>
        {!hideMeter && <AudioIndicatorBar />}
      </Field>

      <Field label="Camera" error={false}>
        <Select
          onChange={(e) => updateCam(e.currentTarget.value)}
          value={selectedCam?.deviceId}
          icon={<Webcam size={24} />}
        >
          {availableCams.length === 0 ? (
            <option value="">Loading devices...</option>
          ) : (
            availableCams.map((cam) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label}
              </option>
            ))
          )}
        </Select>
      </Field>
    </div>
  );
};

export default DeviceSelect;
