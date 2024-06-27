import { useContext, useState } from "react";
import { DatasetContext } from "./DatasetContext";

const useChartEvents = (chart, labeling) => {
  let mouseDown = false;
  let currentPlotLine = undefined;

  const [activePlotLineId, setActivePlotLineId] = useState(null);
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

  const getActivePlotLine = () => {
    if (!chart.current || !chart.current.chart || !activePlotLineId) return;

    var plotLinesAndBands = chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotLine = plotLinesAndBands.find(
      (item) => item.options.isPlotline && item.options.isActive
    );

    return plotLine;
  };

  const getSelectedPlotBand = () => {
    if (!chart.current || !chart.current.chart) return;

    var plotBands = chart.current.chart.xAxis[0].plotLinesAndBands.filter(
      (item) => !item.options.isPlotline
    );
    var plotBand = plotBands.filter(
      (item) => item.options.className === "selected"
    )[0];

    return plotBand;
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
    // const chartBox = chart.current.container.current.getBoundingClientRect();
    // var mousePos = e.clientX - chartBBox.left;

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

    // const chartBox = chart.current.container.current.getBoundingClientRect();
    // var posX = e.clientX - chartBox.left;
    // var posY = e.clientY;
    // const chartBBox = chart.current.container.current.getBoundingClientRect();
    // // console.log(posY, chartBox.top, chartBox.bottom)

    // // if (posY > chartBox.top || posY < chartBox.bottom) {
    // //   return;
    // // }

    // console.log(plotLine)
    // // chart.current.chart.xAxis[0].removePlotBand(plotLine.id);
    // const box_offset = -plotLine.svgElem.getBBox().x;
    // var mousePos = e.clientX - chartBBox.left;
    // let offset = mousePos - box_offset - 1;
    // // console.log(offset)
    // plotLine.svgElem.translate(mousePos, 0);

    // let fixedPosition = activePlotLine.options.isLeftPlotline
    //   ? activePlotbandOptions.to
    //   : activePlotbandOptions.from;
    // let draggedPosition = this.chart.current.chart.xAxis[0].toValue(
    //   Math.max(leftBound, Math.min(mousePos, rightBound))
    // );

    // const activePlotLine = getActivePlotLine();
    // console.log(activePlotLine)
    // if (!activePlotLine) return;
    // e.preventDefault();
    // const chartBBox =
    //     this.chart.current.container.current.getBoundingClientRect();
    // const [leftBound, rightBound] = this.calcBounds(e);
    // const box_offset = -activePlotLine.svgElem.getBBox().x;
    // var mousePos = e.clientX - chartBBox.left;
    // mousePos = mousePos > 10 ? mousePos : 10;
    // mousePos = e.clientX > chartBBox.right ? chartBBox.right : mousePos;
    // // Current mouse position, takes neighbours into account
    // const dragPosition = Math.min(
    //     Math.max(mousePos, leftBound + 1),
    //     rightBound - 1
    // );
    // let offset = dragPosition + box_offset - 1;
    // const activePlotband = this.getActivePlotBand();
    // const activePlotbandOptions = activePlotband.options;
    // activePlotLine.svgElem.translate(offset, 0);
    // const start_plot = chartBBox.left;
    // let fixedPosition = activePlotLine.options.isLeftPlotline
    //     ? activePlotbandOptions.to
    //     : activePlotbandOptions.from;
    // let draggedPosition = this.chart.current.chart.xAxis[0].toValue(
    //     Math.max(leftBound, Math.min(mousePos, rightBound))
    // );
    // draggedPosition = Math.max(0, draggedPosition);
    // this.chart.current.chart.xAxis[0].removePlotBand(activePlotbandOptions.id);
    // this.chart.current.chart.xAxis[0].addPlotBand({
    //     from: activePlotLine.options.isLeftPlotline
    //         ? draggedPosition
    //         : fixedPosition,
    //     to: activePlotLine.options.isLeftPlotline
    //         ? fixedPosition
    //         : draggedPosition,
    //     color: activePlotbandOptions.color,
    //     className: activePlotbandOptions.className,
    //     id: activePlotbandOptions.id,
    //     labelId: activePlotbandOptions.labelId,
    //     label: activePlotbandOptions.label,
    //     zIndex: activePlotbandOptions.zIndex,
    //     isSelected: activePlotbandOptions.isSelected,
    // });
  };

  const onMouseUp = (e, chart) => {
    if (!currentPlotLine) return;

    var plotLinesAndBands = chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotBand = plotLinesAndBands.filter(
      (item) =>
        !item.options.isPlotline &&
        item.options.labelId === currentPlotLine.labelId
    )[0];


    const start = plotBand.options.from;
    const end = plotBand.options.to;
    console.log(plotBand)
    console.log(start, end)
    updateLabelStartEnd(currentPlotLine.labelId, start, end);

    currentPlotLine = undefined;
  };

  const onMouseDown = (e) => {
    mouseDown = true;
    // var plotBand = getSelectedPlotBand();
    // if (plotBand) {
    //   this.onPlotBandMouseDown(
    //     e,
    //     plotBand.options.id,
    //     plotBand.options.labelId
    //   );
    //   return;
    // }

    let position = e.value;

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
  };

  return {
    onMouseDown: onMouseDown,
    onMouseUp: onMouseUp,
    onMouseMoved: onMouseMoved,
    onClickPlotLine: onClickPlotLine,
  };
};

export default useChartEvents;
