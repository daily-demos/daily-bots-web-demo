import React, { useState } from "react";

import HelpTip from "../ui/helptip";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

interface StopSecsProps {
  vadStopSecs: number | undefined;
  handleChange: (value: number[]) => void;
}

const StopSecs: React.FC<StopSecsProps> = ({
  vadStopSecs = 3,
  handleChange,
}) => {
  const [stopSecs, setStopSecs] = useState<number[]>([vadStopSecs]);

  const handleValueChange = (value: number[]) => {
    setStopSecs(value);
    handleChange(value);
  };

  return (
    <div className="flex flex-col justify-between gap-2">
      <Label className="flex flex-row gap-1 items-center shrink-0">
        Speech stop timeout
        <HelpTip text="Time (in seconds) to listen after voice activity detection concludes." />
      </Label>
      <div className="flex flex-row gap-2">
        <Slider
          value={stopSecs}
          min={1.5}
          max={4.5}
          step={0.5}
          onValueChange={handleValueChange}
        />
        <div className="w-24">{stopSecs}s</div>
      </div>
    </div>
  );
};

export default StopSecs;
