import { useContext, useState } from "react";
import { DatasetContext } from "./DatasetContext";

const useChartEvents = (chart, labeling) => {
  let mouseDown = false;

  const [activePlotLineId, setActivePlotLineId] = useState(null);
  const {
    selectedLabelId,
    setSelectedLabelId,
    provisionalLabeling,
    setProvisionalLabeling,
    selectedLabelTypeId,
    addLabel,
    activeLabeling,
  } = useContext(DatasetContext);

  const onClickPosition = (position) => {
    console.log("Clicked position", position);
    if (!provisionalLabeling) {
      // Create a new label with a start position
      const newLabel = {
        start: Math.floor(position),
        end: undefined,
        type: selectedLabelTypeId,
      };
      setProvisionalLabeling(newLabel);
      return;
    }
    
    // Set the end position for the existing provisional label
    const updatedLabel = {
      ...provisionalLabeling,
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
      name: activeLabeling.labels.find(elm => elm._id === updatedLabel.type).name
    };
    
    setProvisionalLabeling(undefined);
    addLabel(labelToAdd);
  };

  const onClickLabel = (label) => {
    if (selectedLabelId === label._id) {
      setSelectedLabelId(null);
      return;
    }
    setSelectedLabelId(label._id);
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

  const onMouseMoved = (e) => {
    // const activePlotLine = this.getActivePlotLine();
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

  const onMouseUp = (e, id) => {
    // if (this.changeNavigator) {
    //     this.afterSetExtremesFunc(this.min, this.max, this.width);
    //     this.changeNavigator = false;
    // }
    mouseDown = false;
    const activePlotLine = getActivePlotLine();
    if (!activePlotLine) {
      return;
    }

    const [leftNeighbour, rightNeighbour] = calcBounds(e, activePlotLine);
    const offset =
      -this.chart.current.container.current.getBoundingClientRect().left;

    activePlotLine.options.isActive = false;

    // Clip between neighbours
    let val = Math.min(
      Math.max(leftNeighbour + 1, e.pageX + offset),
      rightNeighbour - 1
    );

    // Clip between start and end of chart
    val = Math.max(10, val);

    let newValue = this.chart.current.chart.xAxis[0].toValue(val);

    let remainingValue = this.getSecondBoundaryByPlotLineIdAndLabelId(
      activePlotLine.options.id,
      activePlotLine.options.labelId
    ).options.value;

    this.props.onLabelPositionUpdate(
      activePlotLine.options.labelId,
      newValue,
      remainingValue
    );

    this.setState({
      controlStates: {
        activePlotLineId: undefined,
      },
    });
    this.props.updateControlStates(
      this.props.drawingId,
      undefined,
      undefined,
      this.props.canEdit
    );
  };

  const onMouseDown = (e) => {
    console.log(e);
    mouseDown = true;
    var plotBand = getSelectedPlotBand();
    if (plotBand) {
      this.onPlotBandMouseDown(
        e,
        plotBand.options.id,
        plotBand.options.labelId
      );
      return;
    }

    let position = e.value;

    if (!labeling || !labeling.labels) {
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
  };

  return {
    onMouseDown: onMouseDown,
    onMouseUp: onMouseUp,
    onMouseMoved: onMouseMoved,
    selectedLabelId: selectedLabelId,
  };
};

export default useChartEvents;
