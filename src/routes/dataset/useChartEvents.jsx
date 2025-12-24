import { useContext } from "react";
import { DatasetContext } from "./DatasetContext";
import Highcharts from "highcharts/highstock";

const useChartEvents = (chart, labeling) => {
  let mouseDown = false;
  let mouseMoved = false;
  let currentPlotLine = undefined;

  const {
    selectedLabel,
    setSelectedLabel,
    provisionalLabel,
    setProvisionalLabel,
    selectedLabelTypeId,
    activeLabeling,
    updateLabelStartEnd,
  } = useContext(DatasetContext);

  const onClickPlotLine = (e, plotBandId, labelId) => {
    // Stop the event from bubbling up to the chart container
    e.stopPropagation();
    currentPlotLine = { labelId: labelId, plotBandId: plotBandId };
    console.log(currentPlotLine);
  };

  const onClickPosition = (position) => {
    if (!provisionalLabel) {
      setProvisionalLabel({
        start: Math.floor(position),
        end: undefined,
        type: selectedLabelTypeId,
        id: "provisional",
      });
      return;
    }

    // Set the end position for the existing provisional label
    const updatedLabel = {
      ...provisionalLabel,
      end: Math.floor(position),
    };

    // Ensure start is less than end
    if (updatedLabel.start > updatedLabel.end) {
      const temp = updatedLabel.start;
      updatedLabel.start = updatedLabel.end;
      updatedLabel.end = temp;
    }

    // Add the label and reset provisional labeling
    const labelToAdd = {
      ...updatedLabel,
      name: activeLabeling.labels.find((elm) => elm.id === updatedLabel.type)
        .name,
    };

    setProvisionalLabel(labelToAdd);
  };

  const onClickLabel = (label) => {
    if (selectedLabel && selectedLabel.id === label.id) {
      setSelectedLabel(undefined);
      return;
    }
    setSelectedLabel(label);
  };

  const getPlotLineById = (id) => {
    if (!chart.current || !chart.current.chart) return;

    var plotBands = chart.current.chart.xAxis[0].plotLinesAndBands;
    console.log(plotBands);
    var plotBand = plotBands.filter((item) => item.options.id === id)[0];
    return plotBand;
  };

  const updatePlotElements = (labelId, draggedPlotLineId, from, to) => {
    Highcharts.charts.forEach((chartInstance) => {
      if (!chartInstance || !chartInstance.xAxis || !chartInstance.xAxis[0]) {
        return;
      }
      const axis = chartInstance.xAxis[0];
      const plotItems = axis.plotLinesAndBands || [];
      const plotBand = plotItems.find(
        (item) => !item.options.isPlotline && item.options.labelId === labelId
      );
      if (plotBand) {
        const plotBandOptions = plotBand.options;
        axis.removePlotBand(plotBandOptions.id);
        axis.addPlotBand({
          ...plotBandOptions,
          from: from,
          to: to,
        });
      }

      const draggedPlotLine = plotItems.find(
        (item) =>
          item.options.isPlotline && item.options.id === draggedPlotLineId
      );
      if (draggedPlotLine) {
        const draggedOptions = draggedPlotLine.options;
        const value = draggedOptions.isLeftPlotline ? from : to;
        axis.removePlotLine(draggedOptions.id);
        axis.addPlotLine({ ...draggedOptions, value });
      }
    });
  };

  const calcValueBounds = (axis, activePlotLine) => {
    const allPlotLinesAndBands = axis.plotLinesAndBands || [];
    const activeValue = activePlotLine.options.value;
    const activeId = activePlotLine.options.id;
    let minValue = axis.min ?? Number.NEGATIVE_INFINITY;
    let maxValue = axis.max ?? Number.POSITIVE_INFINITY;

    for (let i = 0; i < allPlotLinesAndBands.length; i++) {
      const item = allPlotLinesAndBands[i];
      if (!item?.options?.isPlotline) {
        continue;
      }
      if (item.options.id === activeId) {
        continue;
      }
      const value = item.options.value;
      if (value === undefined || value === null) {
        continue;
      }
      if (value < activeValue && value > minValue) {
        minValue = value;
      }
      if (value > activeValue && value < maxValue) {
        maxValue = value;
      }
    }

    return [minValue, maxValue];
  };

  const onMouseMoved = (e, chart) => {
    if (mouseDown) {
      mouseMoved = true;

      setProvisionalLabel(undefined);
    }
    // console.log(e)
    if (!currentPlotLine) return;

    const plotLine = getPlotLineById(
      currentPlotLine && currentPlotLine.plotBandId
    );
    if (!plotLine) {
      return;
    }

    const axis = chart.current.chart.xAxis[0];
    const chartBBox = chart.current.container.current.getBoundingClientRect();
    const mousePos = e.clientX - chartBBox.left;
    const minGap = 1;
    const rawPosition = axis.toValue(mousePos);
    const [leftBound, rightBound] = calcValueBounds(axis, plotLine);
    const draggedPosition = Math.min(
      Math.max(rawPosition, leftBound + minGap),
      rightBound - minGap
    );

    var plotLinesAndBands = chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotBand = plotLinesAndBands.filter(
      (item) =>
        !item.options.isPlotline &&
        item.options.labelId === currentPlotLine.labelId
    )[0];
    if (!plotBand) {
      currentPlotLine = undefined;
      return;
    }
    if (!plotBand) {
      return;
    }
    const activePlotbandOptions = plotBand.options;

    const siblingId = plotLine.options.isLeftPlotline
      ? "pr" + plotLine.options.labelId
      : "pl" + plotLine.options.labelId;
    const siblingPlotLine = plotLinesAndBands.find(
      (item) => item.options.isPlotline && item.options.id === siblingId
    );
    let fixedPosition = siblingPlotLine
      ? siblingPlotLine.options.value
      : plotLine.options.isLeftPlotline
        ? activePlotbandOptions.to
        : activePlotbandOptions.from;

    const from = Math.min(draggedPosition, fixedPosition);
    const to = Math.max(draggedPosition, fixedPosition);
    updatePlotElements(currentPlotLine.labelId, plotLine.options.id, from, to);
  };

  const onMouseUp = (e, chart) => {
    mouseDown = false;
    mouseMoved = false;
    if (!currentPlotLine || !chart) return;

    var plotLinesAndBands = chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotBand = plotLinesAndBands.filter(
      (item) =>
        !item.options.isPlotline &&
        item.options.labelId === currentPlotLine.labelId
    )[0];

    const start = plotBand.options.from;
    const end = plotBand.options.to;
    updateLabelStartEnd(currentPlotLine.labelId, start, end);

    currentPlotLine = undefined;
  };

  const getSelectedPlotBand = (chart) => {
    if (!chart || !chart.xAxis || !chart.xAxis[0] || !selectedLabel) return;

    var plotBands = chart.xAxis[0].plotLinesAndBands;
    var plotBand = plotBands.filter(
      (item) =>
        !item.options.isPlotline && item.options.labelId === selectedLabel.id
    )[0];
    return plotBand;
  };

  const onMouseDown = (e) => {
    mouseDown = true;
    if (mouseMoved) return;
    let position = e.value;

    const plotBand = getSelectedPlotBand(chart.current.chart);
    if (plotBand) {
      const from = plotBand.options.from;
      const to = plotBand.options.to;
      if (position >= from && position <= to) {
        return;
      }
    }

    // Check if a label has been clicked
    if (labeling && labeling.labels) {
      const onLabel = labeling.labels.find(
        (elm) =>
          elm.start && elm.end && elm.start <= position && elm.end >= position
      );
      if (onLabel) {
        onClickLabel(onLabel);
        return;
      }
    }

    if (selectedLabel) {
      setSelectedLabel(undefined);
    }
    onClickPosition(position);
    e.preventDefault();
    e.stopPropagation();
  };

  return {
    onMouseDown: onMouseDown,
    onMouseUp: onMouseUp,
    onMouseMoved: onMouseMoved,
    onClickPlotLine: onClickPlotLine,
  };
};

export default useChartEvents;
