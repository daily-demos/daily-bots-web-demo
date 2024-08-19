import React, { useEffect, useRef, useState } from "react";
import {
  Sparklines,
  SparklinesBars,
  SparklinesLine,
  SparklinesReferenceLine,
} from "react-sparklines";
import { Loader2, X } from "lucide-react";
import { current } from "tailwindcss/colors";

import { Button } from "../../ui/button";
import HelpTip from "../../ui/helptip";

import styles from "./styles.module.css";

interface StatsProps {
  statsAggregator: StatsAggregator;
  handleClose: () => void;
}

const StatsTile = ({
  service,
  metric,
  tip,
  sub = "s",
  multiplier = 3,
  data,
}: {
  service: string;
  sub?: string;
  metric: string;
  tip?: string;
  multiplier?: number;
  data: MetricValue;
}) => {
  return (
    <div className={styles.serviceStat}>
      <header>
        <div className={styles.serviceName}>
          {service.charAt(0).toUpperCase() + service.slice(1)} {metric}
          {tip && <HelpTip text={tip} />}
        </div>
        <div className={styles.latest}>
          <span>Latest</span>
          <span className="font-medium">
            {data.latest?.toFixed(multiplier)}
            <sub>{sub}</sub>
          </span>
        </div>
      </header>
      <div className={styles.chart}>
        <Sparklines
          data={data.timeseries}
          limit={20}
          height={80}
          svgHeight={80}
        >
          <SparklinesBars style={{ fill: "#41c3f9", fillOpacity: ".25" }} />
          <SparklinesLine style={{ stroke: "#41c3f9", fill: "none" }} />
          <SparklinesReferenceLine type="mean" />
        </Sparklines>
      </div>
      <footer>
        <div className={styles.statValue}>
          H:
          <span>
            {data.high?.toFixed(multiplier)}
            <sub>{sub}</sub>
          </span>
        </div>
        <div className={styles.statValue}>
          M:
          <span>
            {data.median?.toFixed(multiplier)}
            <sub>{sub}</sub>
          </span>
        </div>
        <div className={styles.statValue}>
          L:
          <span>
            {data.low?.toFixed(multiplier)}
            <sub>{sub}</sub>
          </span>
        </div>
      </footer>
    </div>
  );
};

export const Stats = React.memo(
  ({ statsAggregator, handleClose }: StatsProps) => {
    const [currentStats, setCurrentStats] = useState<StatsMap>(
      statsAggregator.statsMap
    );
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current!);
      }

      intervalRef.current = setInterval(async () => {
        // Get latest stats from aggregator
        const newStats = statsAggregator.getStats();
        if (newStats) {
          setCurrentStats({ ...newStats });
        }
      }, 2500);

      return () => clearInterval(intervalRef.current!);
    }, [statsAggregator]);

    //const numTurns = statsAggregator.turns;

    return (
      <div className={styles.container}>
        <div className={styles.close}>
          <Button
            variant="icon"
            size="iconSm"
            onClick={handleClose}
            className="m-3"
          >
            <X />
          </Button>
        </div>
        <div className={styles.inner}>
          <section className={styles.sectionServices}>
            {Object.entries(currentStats).length < 1 ? (
              <div>
                <Loader2 className="animate-spin mx-auto" />
              </div>
            ) : (
              Object.entries(currentStats).map(([service, data], index) => {
                return (
                  <div key={service} className={styles.serviceTiles}>
                    <StatsTile
                      key={`${service}-ttfb-${index}`}
                      metric="TTFB"
                      tip="Time to first byte"
                      service={service}
                      multiplier={3}
                      data={data.ttfb}
                    />
                    {currentStats[service].characters && (
                      <StatsTile
                        key={`${service}-chars-${index}`}
                        metric="Characters"
                        sub=""
                        service={service}
                        multiplier={0}
                        data={data.characters}
                      />
                    )}
                    {currentStats[service].processing && (
                      <StatsTile
                        key={`${service}-proc-${index}`}
                        metric="Processing"
                        service={service}
                        data={data.processing}
                      />
                    )}
                  </div>
                );
              })
            )}
          </section>
        </div>
      </div>
    );
  },
  () => true
);

Stats.displayName = "Stats";

export default Stats;
