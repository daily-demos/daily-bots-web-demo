import React, { useEffect, useState } from "react";
import { Sparklines, SparklinesLine, SparklinesSpots } from "react-sparklines";
import { X } from "lucide-react";

import { Button } from "../../ui/button";

interface RAGStatsDrawerProps {
  ragStats: {
    querySimilarContentTime: number;
    generateResponseTime: number;
    totalRAGTime: number;
    links: Array<{ title: string; url: string }>;
    tokenUsage: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  handleClose: () => void;
}

const RAGStatsDrawer: React.FC<RAGStatsDrawerProps> = ({
  ragStats,
  handleClose,
}) => {
  const [queryTimes, setQueryTimes] = useState<number[]>([]);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [totalTimes, setTotalTimes] = useState<number[]>([]);
  const [totalInputTokens, setTotalInputTokens] = useState(0);
  const [totalOutputTokens, setTotalOutputTokens] = useState(0);

  useEffect(() => {
    const msToSec = (ms: number) => ms / 1000;
    setQueryTimes((prev) =>
      [...prev, msToSec(ragStats.querySimilarContentTime)].slice(-20)
    );
    setResponseTimes((prev) =>
      [...prev, msToSec(ragStats.generateResponseTime)].slice(-20)
    );
    setTotalTimes((prev) =>
      [...prev, msToSec(ragStats.totalRAGTime)].slice(-20)
    );

    setTotalInputTokens((prev) => prev + ragStats.tokenUsage.promptTokens);
    setTotalOutputTokens((prev) => prev + ragStats.tokenUsage.completionTokens);
  }, [ragStats]);

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto z-50 flex flex-col">
      <div className="flex justify-between items-center p-2 border-b">
        <h2 className="text-lg font-bold">RAG Statistics</h2>
        <Button variant="icon" size="iconSm" onClick={handleClose}>
          <X />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <StatTile
            label="Query Time"
            value={ragStats.querySimilarContentTime / 1000}
            unit="s"
            data={queryTimes}
          />
          <StatTile
            label="Response Time"
            value={ragStats.generateResponseTime / 1000}
            unit="s"
            data={responseTimes}
          />
          <StatTile
            label="Total Time"
            value={ragStats.totalRAGTime / 1000}
            unit="s"
            data={totalTimes}
          />
          <TokenUsageTile
            inputTokens={{
              latest: ragStats.tokenUsage.promptTokens,
              total: totalInputTokens,
            }}
            outputTokens={{
              latest: ragStats.tokenUsage.completionTokens,
              total: totalOutputTokens,
            }}
          />
          <div>
            <h3 className="font-semibold mb-2">Sources:</h3>
            <ul className="list-disc pl-5 space-y-1 text-left text-sm">
              {ragStats.links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatTileProps {
  label: string;
  value: number;
  unit: string;
  data: number[];
}

const StatTile: React.FC<StatTileProps> = ({ label, value, unit, data }) => (
  <div className="bg-gray-100 p-2 rounded-md">
    <div className="text-sm font-medium text-gray-600">{label}</div>
    <div className="text-lg font-bold">
      {value.toFixed(3)}
      <span className="text-sm font-normal ml-1">{unit}</span>
    </div>
    <div className="h-16 mt-1">
      <Sparklines data={data} width={200} height={50} margin={5}>
        <SparklinesLine style={{ stroke: "#2563eb", fill: "none" }} />
        <SparklinesSpots
          size={2}
          style={{ stroke: "#2563eb", fill: "white" }}
        />
      </Sparklines>
    </div>
  </div>
);

interface TokenUsageTileProps {
  inputTokens: {
    latest: number;
    total: number;
  };
  outputTokens: {
    latest: number;
    total: number;
  };
}

const TokenUsageTile: React.FC<TokenUsageTileProps> = ({
  inputTokens,
  outputTokens,
}) => (
  <div className="bg-gray-100 p-2 rounded-md">
    <h3 className="font-semibold mb-1">RAG Token Usage</h3>
    <div className="grid grid-cols-2 gap-2 text-sm">
      <div>
        <h4 className="font-medium">Input:</h4>
        <p>Latest: {inputTokens.latest}</p>
        <p>Total: {inputTokens.total}</p>
      </div>
      <div>
        <h4 className="font-medium">Output:</h4>
        <p>Latest: {outputTokens.latest}</p>
        <p>Total: {outputTokens.total}</p>
      </div>
    </div>
  </div>
);

export default RAGStatsDrawer;
