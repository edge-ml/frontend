import React, { Component } from 'react';
import Highcharts, { animObject } from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import './TimeSeriesPanel.css';
import { debounce } from '../../services/helpers';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearchPlus,
  faSearchMinus,
  faCog,
} from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Collapse,
  Fade,
  Input,
  InputGroup,
  Popover,
  PopoverBody,
  PopoverHeader,
  UncontrolledTooltip,
} from 'reactstrap';

const prefixLeftPlotLine = 'plotLine_left_';
const prefixRightPlotLine = 'plotLine_right_';

const ScrollDirection = { LEFT: 'left', RIGHT: 'right' };
const scrollFactor = 0.25;

const ZoomDirection = { IN: 'in', OUT: 'out' };
const zoomFactor = 0.1;

class TimeSeriesPanel extends Component {
  constructor(props) {
    super(props);

    this.chart = React.createRef();

    // global mouse handlers
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMoved = this.onMouseMoved.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    // global keyboard handlers
    this.onKeyDown = this.onKeyDown.bind(this);
    document.addEventListener('mousemove', this.onMouseMoved);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('keydown', this.onKeyDown);

    // PlotBands
    this.onPlotBandMouseDown = this.onPlotBandMouseDown.bind(this);

    this.labelingToPlotBands = this.labelingToPlotBands.bind(this);
    this.getPlotbandByLabelId = this.getPlotbandByLabelId.bind(this);
    this.getSelectedPlotBand = this.getSelectedPlotBand.bind(this);

    // PlotLines
    this.onPlotLineMouseDown = this.onPlotLineMouseDown.bind(this);

    this.getPlotLineById = this.getPlotLineById.bind(this);
    this.getActivePlotLine = this.getActivePlotLine.bind(this);
    this.labelingToPlotLines = this.labelingToPlotLines.bind(this);
    this.generatePlotLine = this.generatePlotLine.bind(this);

    this.getSecondBoundaryByPlotLineIdAndLabelId =
      this.getSecondBoundaryByPlotLineIdAndLabelId.bind(this);

    // state
    this.generateState = this.generateState.bind(this);
    this.state = this.generateState(props);
    this.pastScrubbValue = 0;

    // scroll actions
    this.scroll = this.scroll.bind(this);

    // zoom actions
    this.zoom = this.zoom.bind(this);
    this.mouseDown = false;
    this.changeNavigator = false;
  }

  componentWillReceiveProps(props) {
    let plotlines = this.state.chartOptions.xAxis.plotLines;

    this.setState((state) => this.generateState(props));

    if (plotlines) {
      plotlines = plotlines.filter(
        (plotline) => plotline.id === 'plotline_cursor'
      );
      if (plotlines.length > 0) {
        let chartOptions = this.state.chartOptions;
        chartOptions.xAxis.plotLines.push(plotlines[0]);
        this.setState({ chartOptions });
      }
    }
  }

  componentDidMount() {
    let filteredLabels =
      this.props.labeling.labels !== undefined
        ? this.props.labeling.labels.filter(
            (label) => label.start === undefined || label.end === undefined
          )
        : undefined;

    if (
      filteredLabels !== undefined &&
      filteredLabels.length !== 0 &&
      this.props.updateControlStates !== undefined
    ) {
      this.props.updateControlStates(
        filteredLabels[0]['_id'],
        this.props.drawingPosition,
        this.props.newPosition,
        this.props.canEdit
      );
    }
    if (!this.chart.current) {
      return;
    }
    const container = this.chart.current.container.current;

    container.style.height = this.props.index === 0 ? '80px' : '200px';
    container.style.width = '100%';

    this.chart.current.chart.reflow();

    // do not add buttons for the top panel (scroller)
    if (this.props.index === 0) {
      return;
    }
  }

  // updateData = debounce((chart, min, max, width, offset) => {
  //   if (this.props.onTimeSeriesWindow) {
  //     // FIXME: this doesn't really work with fusedSeries, ignore them for now

  //     chart.showLoading('Loading data from server...');
  //     this.props
  //       .onTimeSeriesWindow(Math.round(min), Math.round(max), Math.round(width))
  //       .then((timeserie) => {
  //         // FIXME: offset/series[0] cause problem with fusedSeries, ignore for now
  //         chart.series[0].setData(timeserie, true, false);
  //         chart.hideLoading();
  //       });
  //   }
  // }, 200);

  afterSetExtremesFunc(min, max, width) {
    if (this.chart && this.chart.current && this.chart.current.chart) {
      const chart = this.chart.current.chart;
      if (this.props.index !== 0) {
        chart.showLoading('Loading from server...');
      }
      this.props
        .onTimeSeriesWindow(Math.round(min), Math.round(max), Math.round(width))
        .then((ts) => {
          chart.series[0].setData(ts, false, false);
          chart.xAxis[0].setExtremes(min, max, true, false);
          chart.hideLoading();
          chart.redraw(true);
        });
    }
  }

  generateState(props) {
    return {
      chartOptions: {
        navigator: {
          maskFill: '#0080ff22',
          enabled: this.props.index === 0,
          series: {
            color: '#ffffff',
            lineWidth: 0,
          },
          xAxis: {
            crosshair: false,
            isInternal: true,
          },
          yAxis: {
            isInternal: true,
          },
          stickyTracking: false,
        },
        rangeSelector: {
          enabled: false,
        },
        panning: false,
        title: null,
        series:
          this.props.index === 0
            ? [
                {
                  lineWidth: 0,
                  marker: {
                    enabled: false,
                    states: {
                      hover: {
                        enabled: false,
                      },
                    },
                  },
                  data: props.data,
                  enableMouseTracking: false,
                },
              ]
            : !Array.isArray(props.name)
            ? [
                {
                  showInLegend: false,
                  name:
                    props.unit === ''
                      ? props.name
                      : props.name + ' (' + props.unit + ')',
                  data: props.data.map((timeAndVal) => [
                    timeAndVal[0],
                    timeAndVal[1] * props.scale + props.offset,
                  ]),
                  lineWidth: 1.5,
                  enableMouseTracking: false,
                },
              ]
            : props.data.map((dataItem, indexOuter) => {
                return {
                  name:
                    props.name[indexOuter] +
                    ' (' +
                    props.unit[indexOuter] +
                    ')',
                  data: props.data.map((timeAndVal) => [
                    timeAndVal[0],
                    timeAndVal[1] * props.scale + props.offset,
                  ]),
                  lineWidth: 1.5,
                  enableMouseTracking: false,
                };
              }),
        xAxis: {
          lineWidth: this.props.index === 0 ? 0 : 1,
          tickLength: this.props.index === 0 ? 0 : 10,
          labels: {
            enabled: this.props.index !== 0,
          },
          type: 'datetime',
          ordinal: false,
          plotBands:
            this.props.index === 0
              ? undefined
              : this.labelingToPlotBands(
                  props.labeling,
                  props.labelTypes,
                  props.selectedLabelId
                ),
          plotLines:
            //state.chartOptions.xAxis.plotLines
            this.props.index === 0
              ? undefined
              : this.labelingToPlotLines(
                  props.labeling.labels,
                  props.labelTypes,
                  props.selectedLabelId
                ),
          crosshair: false,
          min: props.start,
          max: props.end,
          startOnTick: !this.props.isEmpty,
          endOnTick: !this.props.isEmpty,
          events: {
            afterSetExtremes: (e) => {
              this.min = e.min;
              this.max = e.max;
              this.width = e.target.width;
              this.changeNavigator = true;
              Highcharts.charts.forEach((elm) => {
                if (elm) {
                  elm.xAxis[0].setExtremes(
                    e.min,
                    e.max,
                    e.target.width,
                    false,
                    false
                  );
                }
              });
            },
          },
        },
        height: '200px',
        yAxis: {
          height: this.props.index === 0 ? 0 : undefined,
          gridLineWidth: this.props.index === 0 ? 0 : 1,
          labels: {
            enabled: this.props.index !== 0,
            align: 'left',
            x: 0,
            y: -2,
          },
          title: {
            enabled: false,
          },
          opposite: false,
        },
        legend: {
          align: 'left',
          verticalAlign: 'center',
          layout: 'vertical',
          x: 45,
          y: 0,
          enabled: this.props.index !== 0,
        },
        tooltip: {
          enabled: false,
        },
        credits: {
          enabled: false,
        },
        scrollbar: {
          height: 0,
          buttonArrowColor: '#fff',
        },
      },
      labeling: props.labeling,
      labelTypes: props.labelTypes,
      selectedLabelId: props.selectedLabelId,
      onLabelClicked: props.onLabelClicked,
      onScrubbed: props.onScrubbed,
      controlStates: {
        activePlotLineId: !this.state
          ? undefined
          : this.state.controlStates.activePlotLineId,
      },
    };
  }

  /***
   * Global Mouse Handlers
   */
  onMouseDown(e) {
    this.mouseDown = true;
    if (this.props.index === 0) return;
    var plotBand = this.getSelectedPlotBand();
    if (plotBand) {
      this.onPlotBandMouseDown(
        e,
        plotBand.options.id,
        plotBand.options.labelId
      );
      return;
    }
    if (!this.props.canEdit) {
      return;
    }
    const clickLocation = e.pageX - e.target.getBoundingClientRect().left;
    let position = this.chart.current.chart.xAxis[0].toValue(
      clickLocation // TODO hack hardcoded 2 pixels how to fix? This only works in full screen
    );

    // Check if a label has been clicked
    if (this.props.labeling && this.props.labeling.labels) {
      const onLabel = this.props.labeling.labels.find(
        (elm) =>
          elm.start && elm.end && elm.start <= position && elm.end >= position
      );
      if (onLabel) {
        // Label has been clicked
        this.props.onLabelClicked(onLabel._id);
        return;
      }
    }
    this.props.onClickPosition(position);
    e.stopPropagation();
  }

  /***
   * We want to prevent that labels of the same id (with the same name) of a labelling can be moved into
   * each other, and in general, we want to prevent labels being moved outside the visible timeline.
   * To do this, we need to limit the translation to either the x-coordinate of the neirest neigbhbouring labels
   * with the same name, or the x-coords of the timeline bounds.
   * This functions calculates the relative timeline x-coordinates of all these needed parameters
   *
   * The minimum and maximum x-coordinates of the timeline (bounds) are selected in such a way,
   * that positioning a label (plotline) there ist just visible, one value further left/right would
   * make it dissapear.
   *
   * The min/max x-coordinates of the timeseries timesteps do not correspond to the timeline x-coords showing the labels.
   * The minimum timeline x-coordinate is simple: 0. '10' is used instead, because plotlines with coordinates < 10 are invisible.
   *
   * Finding the max x-coordinate though is not straightforward. I ended up using following hack:
   * - insert an invisible dummy plotline (id: -1) with the maximum possible timeseries timestep value into to chart
   * - highcharts automatically translates all timeseries values in relative timeline x-coordinates
   * - retrieve the dummy plotline and access the timelines max x-coord with dummyPlotline.svgElem.getBBox().x
   *
   * TODO: please find a simpler way to get the max timeline x-coordinate
   *
   * @param e MouseMoved/MouseUp event handler
   *
   * @returns (object) {
   *    leftNeighbour:              x-coordinates of lefthand neighbouring plotline, left bound if none,
   *    distanceToLeftNeighbour:    distance to left bound if no leftNeighbour present,
   *    rightNeighbour:             x-coordinates of righthand neighbouring plotline, right bound if none,
   *    distanceToRightNeighbour:   distance to right bound if no rightNeighbour present
   *  }
   */
  calcBounds(e) {
    const allPlotLinesAndBands =
      this.chart.current.chart.xAxis[0].plotLinesAndBands;
    const activePlotLine = this.getActivePlotLine();
    const activeLabelId = activePlotLine.options.labelId;
    const activePlotLine_x = activePlotLine.svgElem.getBBox().x;
    const chartBBox =
      this.chart.current.container.current.getBoundingClientRect();

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
  }

  onMouseMoved(e) {
    const activePlotLine = this.getActivePlotLine();
    if (!activePlotLine) return;
    e.preventDefault();
    const chartBBox =
      this.chart.current.container.current.getBoundingClientRect();
    const [leftBound, rightBound] = this.calcBounds(e);
    const box_offset = -activePlotLine.svgElem.getBBox().x;

    var mousePos = e.clientX - chartBBox.left;
    mousePos = mousePos > 10 ? mousePos : 10;
    mousePos = e.clientX > chartBBox.right ? chartBBox.right : mousePos;
    // Current mouse position, takes neighbours into account
    const dragPosition = Math.min(
      Math.max(mousePos, leftBound + 1),
      rightBound - 1
    );

    let offset = dragPosition + box_offset - 1;

    const activePlotband = this.getActivePlotBand();
    const activePlotbandOptions = activePlotband.options;

    activePlotLine.svgElem.translate(offset, 0);

    const start_plot = chartBBox.left;

    let fixedPosition = activePlotLine.options.isLeftPlotline
      ? activePlotbandOptions.to
      : activePlotbandOptions.from;

    let draggedPosition = this.chart.current.chart.xAxis[0].toValue(
      Math.max(leftBound, Math.min(mousePos, rightBound))
    );

    draggedPosition = Math.max(0, draggedPosition);

    this.chart.current.chart.xAxis[0].removePlotBand(activePlotbandOptions.id);
    this.chart.current.chart.xAxis[0].addPlotBand({
      from: activePlotLine.options.isLeftPlotline
        ? draggedPosition
        : fixedPosition,
      to: activePlotLine.options.isLeftPlotline
        ? fixedPosition
        : draggedPosition,
      color: activePlotbandOptions.color,
      className: activePlotbandOptions.className,
      id: activePlotbandOptions.id,
      labelId: activePlotbandOptions.labelId,
      label: activePlotbandOptions.label,
      zIndex: activePlotbandOptions.zIndex,
      isSelected: activePlotbandOptions.isSelected,
    });
  }

  onMouseUp(e, id) {
    if (this.changeNavigator) {
      this.afterSetExtremesFunc(this.min, this.max, this.width);
      this.changeNavigator = false;
    }
    this.mouseDown = false;
    const activePlotLine = this.getActivePlotLine();
    if (!activePlotLine) {
      return;
    }

    const [leftNeighbour, rightNeighbour] = this.calcBounds(e, activePlotLine);
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
  }

  /***
   * Global Keyboard Handlers
   */
  onKeyDown(e) {
    // switch (e.code) {
    //   // remove ternary condition if the fetching can be done instantaneously to enable continuous scrolling
    //   case 'ArrowRight':
    //     !e.repeat ? this.scroll(ScrollDirection.RIGHT) : (() => {})();
    //     break;
    //   case 'ArrowLeft':
    //     !e.repeat ? this.scroll(ScrollDirection.LEFT) : (() => {})();
    //     break;
    // }
  }

  /***
   * PlotBands
   */
  onPlotBandMouseDown(e, id, labelId) {
    e.stopPropagation();

    var plotBand = this.getSelectedPlotBand();
    if (plotBand && !plotBand.options.className === 'selected') {
      this.state.onLabelClicked(plotBand.options.labelId);
      return;
    } else if (plotBand) {
      this.state.onLabelClicked(undefined);
      return;
    } else {
      this.state.onLabelClicked(labelId);
      return;
    }
  }

  labelingToPlotBands(labeling, labelTypes, selectedLabelId) {
    var mouseDownHandler = this.onPlotBandMouseDown;

    if (labeling.labels === undefined) return [];

    return labeling.labels
      .filter((label) => {
        let types = labelTypes.filter((type) => type['_id'] === label.type);

        if (!types || !types.length > 0) return false;
        return true;
      })
      .map((label) => {
        let labelType = labelTypes.filter(
          (type) => type['_id'] === label.type
        )[0];

        return {
          id: 'band_' + label['_id'],
          labelId: label['_id'],
          from: label.start,
          to: label.end,
          zIndex: 2,
          className:
            selectedLabelId === label['_id'] ? 'selected' : 'deselected',
          color: labelType.color,
          label: {
            text: labelType.name,
            style: {
              color: labelType.color,
              fontWeight: 'bold',
              cursor: undefined,
            },
            isPlotline: false,
            isSelected: selectedLabelId === label['_id'],
          },
          events: {
            mousedown: (e) =>
              mouseDownHandler(e, 'band_' + label['_id'], label['_id']),
          },
        };
      });
  }

  getPlotbandByLabelId(labelId) {
    if (!this.chart.current || !this.chart.current.chart) return;

    var plotLinesAndBands = this.chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotBand = plotLinesAndBands.filter(
      (item) => !item.options.isPlotline && item.options.labelId === labelId
    )[0];

    return plotBand;
  }

  getSelectedPlotBand() {
    if (!this.chart.current || !this.chart.current.chart) return;

    var plotBands = this.chart.current.chart.xAxis[0].plotLinesAndBands.filter(
      (item) => !item.options.isPlotline
    );
    var plotBand = plotBands.filter(
      (item) => item.options.className === 'selected'
    )[0];

    return plotBand;
  }

  /**
   * PlotLines
   */
  onPlotLineMouseDown(e, id) {
    if (!this.props.canEdit) return;

    e.stopPropagation();

    var plotLine = this.getPlotLineById(id);
    if (!plotLine.options.isSelected) {
      this.state.onLabelClicked(plotLine.options.labelId);
      return;
    }

    plotLine.options.isActive = true;
    plotLine.svgElem.translate(0, 0);
    plotLine.options.clickX = e.pageX - plotLine.svgElem.translateX;
    this.setState({
      controlStates: {
        activePlotLineId: id,
      },
    });
    this.props.updateControlStates(
      this.props.drawingId,
      undefined,
      undefined,
      this.props.canEdit
    );
  }

  labelingToPlotLines(labels, labelTypes, selectedLabelId) {
    if (labels === undefined || labelTypes === undefined) return [];

    labels = labels.filter((label) => {
      let types = labelTypes.filter((type) => type['_id'] === label.type);

      if (!types || !types.length > 0) return false;
      return true;
    });

    var plotLines = labels.reduce(
      (result, label) =>
        result.push(
          this.generatePlotLine(
            label['_id'],
            label.type,
            label.start,
            selectedLabelId === label['_id'],
            true,
            labelTypes
          ),
          this.generatePlotLine(
            label['_id'],
            label.type,
            label.end,
            selectedLabelId === label['_id'],
            false,
            labelTypes
          )
        ) && result,
      []
    );

    /*
    (in depth explanation can be found in the docs of "this.calcBounds(e)")
    This is a hacky way to get the righthand bounds x-coordinates of the timeline . 
    The min/max x-coordinates of the timeseries timesteps do not correspond to the timeline x-coords showing the labels.
    The minimum timeline x-coordinate is simple: 0. But we need the max values as well
    The max x-coord can be obtained by inserting a dummy plotline with the max timeseries timestep at the very end,
    and letting highcharts automatcally calculate its relative timeline x-coords. 
    */
    // const rightBoundInvisibleDummyPlotline = {
    //   id: -1,
    //   labelId: -1,
    //   value: this.props.end,
    //   className: 'plotline',
    //   zIndex: 3,
    //   width: 0,
    //   color: '#fff',
    //   isActive: false,
    //   isSelected: false,
    //   isPlotline: true,
    //   isLeftPlotline: false,
    //   isInvisible: true,
    // };
    // plotLines.push(rightBoundInvisibleDummyPlotline);

    return plotLines;
  }

  generatePlotLine(
    labelId,
    labelTypeId,
    value,
    isLabelSelected,
    isLeft,
    labelTypes
  ) {
    var plotLineId = isLeft
      ? prefixLeftPlotLine + labelId
      : prefixRightPlotLine + labelId;
    var isPlotLineCurrentlyDragged = !this.state
      ? false
      : this.state.controlStates.activePlotLineId === plotLineId;
    var labelColor = labelTypes.filter(
      (labelType) => labelType['_id'] === labelTypeId
    )[0].color;

    var mouseDownHandler = this.onPlotLineMouseDown;

    return {
      id: plotLineId,
      labelId: labelId,
      value: value,
      className: 'plotline',
      zIndex: 3,
      width: isLabelSelected ? 5 : 2,
      color: labelColor,
      isActive: isPlotLineCurrentlyDragged,
      isSelected: isLabelSelected,
      isPlotline: true,
      isLeftPlotline: isLeft,
      events: {
        mousedown: (e) => mouseDownHandler(e, plotLineId, labelId),
      },
    };
  }

  getPlotLineById(id) {
    if (!this.chart.current || !this.chart.current.chart) return;

    var plotLinesAndBands = this.chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotLine = plotLinesAndBands.filter(
      (item) => item.options.isPlotline && item.options.id === id
    )[0];

    return plotLine;
  }

  getActivePlotLine() {
    if (
      !this.chart.current ||
      !this.chart.current.chart ||
      !this.state.controlStates.activePlotLineId
    )
      return;

    var plotLinesAndBands = this.chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotLine = plotLinesAndBands.find(
      (item) => item.options.isPlotline && item.options.isActive
    );

    return plotLine;
  }

  getActivePlotBand() {
    const activePlotLine = this.getActivePlotLine();
    if (!activePlotLine) return;

    return this.getPlotbandByLabelId(activePlotLine.options.labelId);
  }

  getSecondBoundaryByPlotLineIdAndLabelId(id, labelId) {
    if (!this.chart.current || !this.chart.current.chart) return;

    var plotLinesAndBands = this.chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotLine = plotLinesAndBands.filter(
      (item) =>
        item.options.isPlotline &&
        item.options.labelId === labelId &&
        item.options.id !== id
    )[0];

    return plotLine;
  }

  scroll(direction) {
    const width =
      this.chart.current.chart.xAxis[0].max -
      this.chart.current.chart.xAxis[0].min +
      1;
    const sign = direction === ScrollDirection.LEFT ? -1 : 1;
    this.chart.current.chart.xAxis[0].setExtremes(
      this.chart.current.chart.xAxis[0].min + sign * width * scrollFactor,
      this.chart.current.chart.xAxis[0].max + sign * width * scrollFactor
    );
  }

  zoom(direction) {
    const width =
      this.chart.current.chart.xAxis[0].max -
      this.chart.current.chart.xAxis[0].min +
      1;
    const sign = direction === ZoomDirection.IN ? 1 : -1;
    this.chart.current.chart.xAxis[0].setExtremes(
      this.chart.current.chart.xAxis[0].min + sign * width * zoomFactor,
      this.chart.current.chart.xAxis[0].max - sign * width * zoomFactor
    );
  }

  render() {
    if (!this.props.data.length && this.props.index === 0) {
      return null;
    }

    if (!this.props.data.length) {
      return <div className="noDataLabel">{this.props.name}: No data</div>;
    }

    return (
      <div
        className="mt-2"
        style={{
          position: 'relative',
          overflow: 'visible',
          marginBottom:
            this.props.index === 0
              ? 0
              : this.props.index < this.props.numSeries - 1
              ? '-25px'
              : '-10px',
        }}
      >
        {this.props.index !== 0 && !this.props.isEmpty ? (
          <div className="chartMenuWrapper">
            <button
              className="chartBtn"
              style={{ marginRight: '1px' }}
              key={'unitMenuButton' + this.props.index}
              id={'unitMenuButton' + this.props.index}
              onClick={(e) => this.props.toggleUnitMenu()}
            >
              <FontAwesomeIcon icon={faCog} size="xs" color="#999999" />
            </button>
            <Popover
              target={'unitMenuButton' + this.props.index}
              isOpen={this.props.isUnitMenuOpen}
              toggle={(e) => this.props.toggleUnitMenu()}
              trigger="legacy"
            >
              <PopoverHeader className="text-center">
                Configuration
              </PopoverHeader>
              <PopoverBody id="scalingConfigMenu">
                <InputGroup size="sm">
                  <div className="input-group-prepend w-25">
                    <span className="input-group-text w-100 justify-content-center">
                      Unit
                    </span>
                  </div>
                  <Input
                    type="text"
                    value={this.props.unit}
                    onChange={(e) =>
                      this.props.handleUnitChange(e.target.value)
                    }
                  />
                </InputGroup>
                <InputGroup size="sm">
                  <div className="input-group-prepend w-25">
                    <span className="input-group-text w-100 justify-content-center">
                      Scale
                    </span>
                  </div>
                  <Input
                    type="number"
                    value={this.props.scale}
                    onChange={(e) =>
                      this.props.handleScaleChange(e.target.value)
                    }
                  />
                </InputGroup>
                <InputGroup size="sm">
                  <div className="input-group-prepend w-25">
                    <span className="input-group-text w-100 justify-content-center">
                      Offset
                    </span>
                  </div>
                  <Input
                    type="number"
                    value={this.props.offset}
                    onChange={(e) =>
                      this.props.handleOffsetChange(e.target.value)
                    }
                  />
                </InputGroup>
                <div
                  className="d-flex justify-content-end"
                  id="scalingSaveButtonWrapper"
                >
                  <Button
                    color="primary"
                    id="scalingSaveButton"
                    onClick={(e) =>
                      this.props.handleConfigSave(
                        this.props.unit,
                        this.props.scale,
                        this.props.offset
                      )
                    }
                  >
                    Save
                  </Button>
                  <UncontrolledTooltip
                    target="scalingSaveButton"
                    placement="left"
                    container="scalingConfigMenu"
                    arrowClassName="mr-0 border-white bg-transparent"
                  >
                    Saves the configuration in the database
                  </UncontrolledTooltip>
                </div>
              </PopoverBody>
            </Popover>
            <button
              className="chartBtn"
              style={{ marginRight: '1px' }}
              onClick={(e) => this.zoom(ZoomDirection.OUT)}
              key={'zoomOutButton' + this.props.index}
            >
              <FontAwesomeIcon icon={faSearchMinus} size="xs" color="#999999" />
            </button>
            <button
              className="chartBtn"
              onClick={(e) => this.zoom(ZoomDirection.IN)}
              key={'zoomInButton' + this.props.index}
            >
              <FontAwesomeIcon icon={faSearchPlus} size="xs" color="#999999" />
            </button>
          </div>
        ) : null}
        {this.props.index !== 0 && !this.props.isEmpty ? (
          <div>
            <button
              className="scrollBtn scrollBtnLeft"
              onClick={(e) => this.scroll(ScrollDirection.LEFT)}
            >
              &lt;
            </button>
            <button
              className="scrollBtn scrollBtnRight"
              onClick={(e) => this.scroll(ScrollDirection.RIGHT)}
            >
              &gt;
            </button>
          </div>
        ) : null}
        <div className="chartWrapper" onMouseDown={this.onMouseDown}>
          {this.props.index !== 0 ? (
            <div className="font-weight-bold d-flex">
              {this.props.originalUnit === ''
                ? this.props.name
                : this.props.name + ' (' + this.props.originalUnit + ')'}
              <Fade
                in={
                  this.props.unit !== '' &&
                  this.props.unit !== this.props.originalUnit
                }
              >
                &nbsp;[viewed as: {this.props.unit}]
              </Fade>
            </div>
          ) : null}
          <Collapse
            isOpen={
              this.props.index !== 0 &&
              (this.props.scale !== 1 || this.props.offset !== 0)
            }
          >
            Scale: {this.props.scale}, Offset: {this.props.offset}
          </Collapse>
          <HighchartsReact
            ref={this.chart}
            highcharts={Highcharts}
            options={this.generateState(this.props).chartOptions}
            oneToOne={true}
            constructorType={'stockChart'}
            containerProps={{ style: { height: '100%' } }}
          />
        </div>
      </div>
    );
  }
}
export default TimeSeriesPanel;
