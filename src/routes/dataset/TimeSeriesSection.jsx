import React, { useContext, useEffect, useMemo, useState } from "react";
import { Center, Stack, Text } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWaveSquare } from "@fortawesome/free-solid-svg-icons";
import { DatasetContext } from "./DatasetContext";
import TimeSeriesDisplay from "./TimeSeriesDisplay";
import ChartSlider from "./ChartSlider";

const TimeSeriesSection = () => {
  const { activeTimeSeries, dataset } = useContext(DatasetContext);

  const fullRange = useMemo(() => {
    const starts = activeTimeSeries
      .map((timeSeries) => Number(timeSeries.start))
      .filter(Number.isFinite);
    const ends = activeTimeSeries
      .map((timeSeries) => Number(timeSeries.end))
      .filter(Number.isFinite);

    return {
      min: starts.length > 0 ? Math.min(...starts) : 0,
      max: ends.length > 0 ? Math.max(...ends) : 1,
    };
  }, [activeTimeSeries]);

  const [visibleRange, setVisibleRange] = useState(fullRange);

  useEffect(() => {
    setVisibleRange(fullRange);
  }, [fullRange.max, fullRange.min]);

  if (activeTimeSeries.length === 0) {
    return (
      <Center className="flex-grow-1" style={{ minHeight: 0 }}>
        <Stack align="center" gap="xs" p="xl">
          <FontAwesomeIcon
            icon={faWaveSquare}
            size="2x"
            color="var(--mantine-color-gray-4)"
          />
          <Text fw={600}>No time series selected</Text>
          <Text size="sm" c="dimmed" ta="center" maw={320}>
            {dataset.timeSeries.length > 0
              ? "Open the Time Series menu above to choose which series to display."
              : "This dataset has no time series."}
          </Text>
        </Stack>
      </Center>
    );
  }

  const hiddenCount = dataset.timeSeries.length - activeTimeSeries.length;

  return (
    <>
      <ChartSlider
        start={fullRange.min}
        end={fullRange.max}
        visibleRange={visibleRange}
        onRangeChange={setVisibleRange}
      />
      <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
        {hiddenCount > 0 ? (
          <Text size="xs" c="dimmed" px="sm" pt={4}>
            Showing {activeTimeSeries.length} of {dataset.timeSeries.length} time
            series — add more from the Time Series menu.
          </Text>
        ) : null}
        {activeTimeSeries.map((timeSeries) => (
          <TimeSeriesDisplay
            key={timeSeries._id}
            timeSeries={timeSeries}
            fullRange={fullRange}
            visibleRange={visibleRange}
            onRangeChange={setVisibleRange}
          />
        ))}
      </div>
    </>
  );
};

export default TimeSeriesSection;
