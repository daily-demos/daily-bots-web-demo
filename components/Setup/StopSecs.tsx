import React, { useEffect, useState } from "react";

import { useDebounce } from "@uidotdev/usehooks";
import HelpTip from "../ui/helptip";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

interface StopSecsProps {
  vadStopSecs: number | undefined;
  handleChange: (value: number) => void;
}

const StopSecs: React.FC<StopSecsProps> = ({
  vadStopSecs = 0.3,
  handleChange,
}) => {
  const [stopSecs, setStopSecs] = useState<number>(vadStopSecs);
  const debouncedUpdate = useDebounce(stopSecs, 500);

  const handleValueChange = (value: number[]) => {
    if (value[0] === stopSecs) return;
    setStopSecs(value[0]);
  };

  useEffect(() => {
    if (debouncedUpdate !== vadStopSecs) {
      handleChange(debouncedUpdate);
    }
  }, [debouncedUpdate, handleChange, vadStopSecs]);

  return (
    <div className="flex flex-col justify-between gap-2">
      <Label className="flex flex-row gap-1 items-center shrink-0">
        Speech stop timeout
        <HelpTip text="Timeout (seconds) voice activity detection waits after you stop speaking" />
      </Label>
      <div className="flex flex-row gap-2">
        <Slider
          value={[stopSecs]}
          min={0.1}
          max={2}
          step={0.1}
          onValueChange={handleValueChange}
        />
        <div className="w-24">{stopSecs}s</div>
      </div>
    </div>
  );
};

export default StopSecs;
