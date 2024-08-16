import React from "react";

const Configuration: React.FC<{ showAllOptions: boolean }> = ({
  showAllOptions = false,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {showAllOptions && <p>LLM Config options go here</p>}
    </div>
  );
};

export default Configuration;
