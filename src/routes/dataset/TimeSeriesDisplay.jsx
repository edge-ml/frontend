import React, { useContext, useState } from "react";
import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import useTimeSeriesData from "../../Hooks/useTimeSeriesData";
import { DatasetContext } from "./DatasetContext";
import TimeSeriesChart from "./TimeSeriesChart";
import TimeSeriesUnitEditor from "../../components/TimeSeriesUnit/TimeSeriesUnitEditor";
import { setTimeSeriesUnit } from "../../services/ApiServices/DatasetServices";

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
    refreshDataset,
  } = useContext(DatasetContext);
  // activeTimeSeries holds copies taken when the dataset loaded; read the unit
  // from the dataset itself so edits show up after a refresh.
  const current =
    dataset.timeSeries.find((ts) => ts._id === timeSeries._id) ?? timeSeries;

  const onUnitSave = async (quantity, unit) => {
    await setTimeSeriesUnit(dataset._id, timeSeries._id, quantity, unit);
    await refreshDataset();
  };
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
          <TimeSeriesUnitEditor timeSeries={current} onSave={onUnitSave} />
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
        unit={current.unit}
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
