import React from "react";
import { Sparklines, SparklinesLine, SparklinesSpots } from "react-sparklines";
import { X } from "lucide-react";

import { Button } from "../../ui/button";

interface RAGStatsDrawerProps {
  ragStats: {
    querySimilarContentTime: number;
    generateResponseTime: number;
    totalRAGTime: number;
    links: Array<{ title: string; url: string }>;
  };
  ragStatsHistory: {
    queryTimes: number[];
    responseTimes: number[];
    totalTimes: number[];
  };
  handleClose: () => void;
}

const RAGStatsDrawer: React.FC<RAGStatsDrawerProps> = ({
  ragStats,
  ragStatsHistory,
  handleClose,
}) => {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto z-50 flex flex-col">
      <div className="flex justify-end p-2">
        <Button
          variant="icon"
          size="iconSm"
          onClick={handleClose}
          className="m-1"
        >
          <X />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <section>
          <h2 className="text-lg font-bold mb-4">RAG Statistics</h2>
          <div className="space-y-4">
            <StatTile
              label="Query Time"
              value={ragStats.querySimilarContentTime}
              unit="ms"
              data={ragStatsHistory.queryTimes}
            />
            <StatTile
              label="Response Time"
              value={ragStats.generateResponseTime}
              unit="ms"
              data={ragStatsHistory.responseTimes}
            />
            <StatTile
              label="Total Time"
              value={ragStats.totalRAGTime}
              unit="ms"
              data={ragStatsHistory.totalTimes}
            />
            <div>
              <h3 className="font-semibold mb-2">Sources:</h3>
              <ul className="list-disc pl-4 space-y-1 text-sm text-left">
                {ragStats.links.map((link, index) => (
                  <li key={index} className="pl-1">
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
        </section>
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
  <div className="bg-gray-100 p-3 rounded-md">
    <div className="text-sm font-medium text-gray-600">{label}</div>
    <div className="text-lg font-bold">
      {value.toFixed(2)}
      <span className="text-sm font-normal ml-1">{unit}</span>
    </div>
    <div className="h-20 mt-2">
      <Sparklines data={data} width={200} height={60} margin={5}>
        <SparklinesLine style={{ stroke: "#2563eb", fill: "none" }} />
        <SparklinesSpots
          size={2}
          style={{ stroke: "#2563eb", fill: "white" }}
        />
      </Sparklines>
    </div>
  </div>
);

export default RAGStatsDrawer;
