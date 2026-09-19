import React, { useContext, useState } from "react";
import { ActionIcon, Badge, Group, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import useTimeSeriesData from "../../Hooks/useTimeSeriesData";
import { DatasetContext } from "./DatasetContext";
import TimeSeriesChart from "./TimeSeriesChart";

const TimeSeriesDisplay = ({
  timeSeries,
  fullRange,
  visibleRange,
  onRangeChange,
}) => {
  const {
    dataset,
    activeTimeSeries,
    setActiveTimeSeries,
    labelsToShow,
    selectedLabel,
    setSelectedLabel,
    onPlotClick,
    updateLabelStartEnd,
  } = useContext(DatasetContext);
  const [chartWidth, setChartWidth] = useState(window.innerWidth);
  const { timeSeriesData } = useTimeSeriesData(
    dataset._id,
    timeSeries._id,
    visibleRange,
    chartWidth
  );

  const onHide = () =>
    setActiveTimeSeries(
      activeTimeSeries.filter((ts) => ts._id !== timeSeries._id)
    );

  return (
    <section className="time-series-item m-2">
      <Group justify="space-between" align="center" wrap="nowrap" gap="xs">
        <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
          <h6 className="fw-bold time-series-name">{timeSeries.name}</h6>
          {timeSeries.unit ? (
            <Badge size="xs" variant="light" color="gray">
              {timeSeries.unit}
            </Badge>
          ) : null}
        </Group>
        <Tooltip label="Hide from view" withinPortal openDelay={300}>
          <ActionIcon
            className="time-series-hide"
            size="sm"
            variant="subtle"
            color="gray"
            aria-label={`Hide ${timeSeries.name}`}
            onClick={onHide}
          >
            <FontAwesomeIcon icon={faXmark} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <TimeSeriesChart
        name={timeSeries.name}
        unit={timeSeries.unit}
        points={timeSeriesData}
        fullRange={fullRange}
        visibleRange={visibleRange}
        labels={labelsToShow}
        selectedLabel={selectedLabel}
        onPlotClick={onPlotClick}
        onRangeChange={onRangeChange}
        onLabelSelect={setSelectedLabel}
        onBoundaryCommit={updateLabelStartEnd}
        onWidthChange={setChartWidth}
      />
    </section>
  );
};

export default TimeSeriesDisplay;
