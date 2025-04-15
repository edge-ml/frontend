import { useContext, useState } from "react";
import { DatasetContext } from "./DatasetContext";

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
      name: activeLabeling.labels.find((elm) => elm._id === updatedLabel.type)
        .name,
    };

    setProvisionalLabel(labelToAdd);
  };

  const onClickLabel = (label) => {
    if (selectedLabel && selectedLabel._id === label._id) {
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

  const calcBounds = (e, chart, activePlotLine) => {
    const allPlotLinesAndBands = chart.current.chart.xAxis[0].plotLinesAndBands;
    const activeLabelId = activePlotLine.options.labelId;
    const activePlotLine_x = activePlotLine.svgElem.getBBox().x;
    const chartBBox = chart.current.container.current.getBoundingClientRect();

    let minDiffLeft = 0;
    let minDiffRight = chartBBox.right - chartBBox.left;
    for (var i = 0; i < allPlotLinesAndBands.length; i++) {
      const elm = allPlotLinesAndBands[i];
      if (activeLabelId == elm.options.labelId || !elm.options.isPlotline) {
        continue;
      }
      const pos = elm.svgElem.getBBox().x;
      const diff = activePlotLine_x - pos;
      if (diff < 0) {
        minDiffRight = Math.min(pos, minDiffRight);
      } else {
        minDiffLeft = Math.max(pos, minDiffLeft);
      }
    }
    return [minDiffLeft, minDiffRight];
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

    const [leftBound, rightBound] = calcBounds(e, chart, plotLine);
    const chartBBox = chart.current.container.current.getBoundingClientRect();
    const box_offset = -plotLine.svgElem.getBBox().x;
    var mousePos = e.clientX - chartBBox.left;
    const dragPosition = Math.min(
      Math.max(mousePos, leftBound + 1),
      rightBound - 1
    );
    let offset = dragPosition + box_offset - 1;
    plotLine.svgElem.translate(offset, 0);

    var plotLinesAndBands = chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotBand = plotLinesAndBands.filter(
      (item) =>
        !item.options.isPlotline &&
        item.options.labelId === currentPlotLine.labelId
    )[0];
    const activePlotbandOptions = plotBand.options;

    let fixedPosition = plotLine.options.isLeftPlotline
      ? activePlotbandOptions.to
      : activePlotbandOptions.from;

    let draggedPosition = chart.current.chart.xAxis[0].toValue(
      Math.max(leftBound, Math.min(mousePos, rightBound))
    );

    chart.current.chart.xAxis[0].removePlotBand(activePlotbandOptions.id);
    chart.current.chart.xAxis[0].addPlotBand({
      ...activePlotbandOptions,
      from: plotLine.options.isLeftPlotline ? draggedPosition : fixedPosition,
      to: plotLine.options.isLeftPlotline ? fixedPosition : draggedPosition,
    });
  };

  const onMouseUp = (e, chart) => {
    mouseDown = false;
    mouseMoved = false;
    if (!currentPlotLine) return;

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
    if (!chart.current || !chart.current.chart) return;

    var plotBands = chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotBand = plotBands.filter(
      (item) =>
        !item.options.isPlotline && item.options.labelId === selectedLabel._id
    )[0];
    return plotBand;
  };

  const onMouseDown = (e) => {
    mouseDown = true;
    if (mouseMoved) return;
    let position = e.value;

    var plotBand = getSelectedPlotBand(chart.current.chart);
    if (plotBand) {
      return;
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
