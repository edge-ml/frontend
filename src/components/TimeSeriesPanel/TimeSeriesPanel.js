import React, { Component } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import './TimeSeriesPanel.css';
import DropdownPanel from './DropdownPanel';
import { debounce } from '../../services/helpers';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearchPlus, faSearchMinus } from '@fortawesome/free-solid-svg-icons';

const prefixLeftPlotLine = 'plotLine_left_';
const prefixRightPlotLine = 'plotLine_right_';

const ScrollDirection = {LEFT: 'left', RIGHT: 'right'};
const scrollFactor = 0.25;

const ZoomDirection = {IN: 'in', OUT: 'out'};
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
    this.oldMin = undefined;
    this.oldMAx = undefined;
    this.oldWidth = undefined;

    // scroll actions
    this.scroll = this.scroll.bind(this);

    // zoom actions
    this.zoom = this.zoom.bind(this);
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

    const container = this.chart.current.container.current;

    container.style.height = this.props.index === 0 ? '80px' : '200px';
    container.style.width = '100%';

    this.chart.current.chart.reflow();

    // do not add buttons for the top panel (scroller)
    if (this.props.index === 0) {
      return;
    }
    const leftButton = document.createElement('button');
    leftButton.innerHTML = '<';
    leftButton.style.cssText = `
      position: absolute;
      left: 10px;
      top: 37.5%;
      transform: translateY(-50%);
      border: none;
      background: transparent;
      font-size: 30px;
      cursor: pointer;
      color: grey;
      font-family: Monaco, monospace;
      user-select: none;
    `;
    leftButton.addEventListener('mousedown', (e) => {
      e.stopImmediatePropagation();
      this.scroll(ScrollDirection.LEFT);
    });

    leftButton.addEventListener('mouseover', function () {
      leftButton.style.color = 'black';
    });

    leftButton.addEventListener('mouseout', function () {
      leftButton.style.color = 'grey';
    });

    const rightButton = document.createElement('button');
    rightButton.innerHTML = '>';
    rightButton.style.cssText = `
      position: absolute;
      right: 10px;
      top: 37.5%;
      transform: translateY(-50%);
      border: none;
      background: transparent;
      font-size: 30px;
      cursor: pointer;
      color: grey;
      font-family: Monaco, monospace;
      user-select: none;
    `;
    rightButton.addEventListener('mousedown', (e) => {
      e.stopImmediatePropagation();
      this.scroll(ScrollDirection.RIGHT);
    });

    rightButton.addEventListener('mouseover', function () {
      rightButton.style.color = 'black';
    });

    rightButton.addEventListener('mouseout', function () {
      rightButton.style.color = 'grey';
    });

    this.chart.current.chart.renderTo.parentNode.appendChild(leftButton);
    this.chart.current.chart.renderTo.parentNode.appendChild(rightButton);
  }

  updateData = debounce((chart, min, max, width, offset) => {
    // console.log('up', min, max, width);
    if (this.props.onTimeSeriesWindow) {
      // FIXME: this doesn't really work with fusedSeries, ignore them for now
      const timeSeriesIndex = this.props.index - 1; // -1 cause 0 is the scrollbar

      chart.showLoading('Loading data from server...');
      this.props
        .onTimeSeriesWindow(
          timeSeriesIndex,
          Math.round(min) + 1,
          Math.round(max) + 1,
          Math.round(width * 1.3)
        )
        .then((timeserie) => {
          // FIXME: offset/series[0] cause problem with fusedSeries, ignore for now
          chart.series[0].setData(timeserie, true, false);
          chart.hideLoading();
        });
    }
  }, 100);

  generateState(props) {
    return {
      chartOptions: {
        navigator: {
          maskFill: '#77777777',
          enabled: this.props.index === 0,
          series: {
            color: '#ffffff',
            lineWidth: 0,
          },
          xAxis: {
            isInternal: true,
          },
          yAxis: {
            isInternal: true,
          },
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
                },
              ]
            : !Array.isArray(props.name)
            ? [
                {
                  showInLegend: !props.isEmpty,
                  name:
                    props.unit === ''
                      ? props.name
                      : props.name + ' (' + props.unit + ')',
                  data: props.data,
                  lineWidth: 1,
                },
              ]
            : props.data.map((dataItem, indexOuter) => {
                return {
                  name:
                    props.name[indexOuter] +
                    ' (' +
                    props.unit[indexOuter] +
                    ')',
                  data: props.data,
                  lineWidth: 1,
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
          crosshair: {
            snap: false,
          },
          min: props.start,
          max: props.end,
          startOnTick: false,
          endOnTick: false,
          events: {
            afterSetExtremes: (e) => {
              if (this.chart.current.chart && Highcharts.charts) {
                Highcharts.charts
                  .filter((chart) => {
                    return chart;
                  })
                  .forEach((chart) => {
                    if (chart.index !== this.chart.current.chart.index) {
                      let ex = chart.xAxis[0].getExtremes();
                      if (ex.min !== e.min || ex.max !== e.max) {
                        chart.xAxis[0].setExtremes(e.min, e.max, true, false);
                      }
                    }
                  });
              }

              const { chart, width, min, max } = e.target;
              if (
                Math.abs(this.oldMin - min) > 10 ||
                Math.abs(this.oldMAx - max) > 10 ||
                Math.abs(this.oldWidth - width) > 10 ||
                this.oldMin === undefined
              ) {
                this.oldMAx = max;
                this.oldMin = min;
                this.oldWidth = width;
                this.updateData(chart, min - 1, max + 1, width, props.offset);
              }
            },
          },
        },
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
    console.log('mouse down', e);
    let position = this.chart.current.chart.xAxis[0].toValue(
      e.pageX - this.chart.current.chart.plotBox.x * 1.5 - 160 // TODO hack hardcoded 2 pixels how to fix?
    );

    // Check if a label has been clicked
    if (this.props.labeling && this.props.labeling.labels) {
      const onLabel = this.props.labeling.labels.find(
        (elm) => elm.start <= position && elm.end >= position
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
    const activeLabelName = this.props.labeling.labels.filter(
      (item) => item._id === activeLabelId
    )[0].name;
    const activePlotLine_x = activePlotLine.svgElem.getBBox().x;
    const rightBoundInvisibleDummyPlotline = allPlotLinesAndBands.filter(
      (item) => item.options.isPlotline && item.id === -1
    )[0];
    const maxTimelinesXCoord =
      rightBoundInvisibleDummyPlotline.svgElem.getBBox().x;

    // all label ids from same label name excluding itself, so all other label ids to the right or left
    const allNeighbouringLabelIds = this.props.labeling.labels
      .filter(
        (item) => item.name === activeLabelName && item._id !== activeLabelId
      )
      .map((x) => x._id);

    // all plotlines/bands corresponding to "allNeighbouringLabelIds". Only Plotlines are of interest here
    let neighbouringPlotLines_x = allPlotLinesAndBands
      .filter(
        (item) =>
          item.options.isPlotline &&
          allNeighbouringLabelIds.includes(item.options.labelId)
      )
      .map((x) => x.svgElem.getBBox().x);

    // get the x-coordinates of the nearest neighbouring plotlines left and right. If none are present, default values are 10 and maxTimelinesXCoord.
    neighbouringPlotLines_x.push(activePlotLine_x);
    neighbouringPlotLines_x = neighbouringPlotLines_x.sort((a, b) => a - b);
    const index = neighbouringPlotLines_x.indexOf(activePlotLine_x);

    // if there's no left neigbour, set the left bound to 10, to prevent positioning the label outside the timeline
    const leftNeighbour = index === 0 ? 10 : neighbouringPlotLines_x[index - 1];
    const rightNeighbour =
      index === neighbouringPlotLines_x.length - 1
        ? maxTimelinesXCoord
        : neighbouringPlotLines_x[index + 1];
    const distanceToLeftNeighbour = activePlotLine_x - leftNeighbour;
    const distanceToRightNeighbour = rightNeighbour - activePlotLine_x;

    /* 
    e.chartX is the x-coordinate of the mouspointer in the timeline, it changes with the plotline x coordinate when dragged
    if e.chartX is undefined, the plotline is dragged outside the timeline
    e.chartX is then set to the bounds of the timeline to prevent weird visual behaviour 
     
    e.pageX is the x-coordinate of the mouspointer in window coordinates (?),
    if <= 200 the mousepointer is in the left half of the window
    */
    if (!e.chartX) e.chartX = e.pageX <= 200 ? 10 : maxTimelinesXCoord;

    return {
      leftNeighbour: leftNeighbour,
      distanceToLeftNeighbour: distanceToLeftNeighbour,
      rightNeighbour: rightNeighbour,
      distanceToRightNeighbour: distanceToRightNeighbour,
    };
  }

  onMouseMoved(e) {
    const activePlotLine = this.getActivePlotLine();
    if (!activePlotLine) return;

    e.preventDefault();

    const bounds = this.calcBounds(e);
    const leftNeighbour = bounds.leftNeighbour;
    const distanceToLeftNeighbour = bounds.distanceToLeftNeighbour;
    const rightNeighbour = bounds.rightNeighbour;
    const distanceToRightNeighbour = bounds.distanceToRightNeighbour;
    const activePlotbandOptions = this.getActivePlotBand().options;
    const offset_translatePlotLine =
      -activePlotLine.svgElem.getBBox().x +
      this.chart.current.chart.plotBox.x * 0.08;
    const offset_translatePlotBand =
      -this.chart.current.chart.plotBox.x * 1.5 - 160;

    // move the currencly active plotline with the mousepointer
    activePlotLine.svgElem.translate(
      Math.max(
        -distanceToLeftNeighbour,
        Math.min(e.chartX + offset_translatePlotLine, distanceToRightNeighbour)
      ),
      0
    );

    // instead of moving the plotband along with the plotline, it is deleted and redrawn with the new mousepointer coordinates
    let fixedPosition = activePlotLine.options.isLeftPlotline
      ? activePlotbandOptions.to
      : activePlotbandOptions.from;
    let draggedPosition = this.chart.current.chart.xAxis[0].toValue(
      Math.max(
        leftNeighbour,
        Math.min(e.pageX + offset_translatePlotBand, rightNeighbour)
      )
    );

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
    const activePlotLine = this.getActivePlotLine();
    if (!activePlotLine) return;

    const bounds = this.calcBounds(e, activePlotLine);
    const leftNeighbour = bounds.leftNeighbour;
    const rightNeighbour = bounds.rightNeighbour;
    const offset =
      -this.chart.current.chart.plotBox.x * 1.5 +
      this.chart.current.chart.plotBox.x * 0.08 -
      160;

    activePlotLine.options.isActive = false;

    // add + 1 to the distance so that the plotlines do not directly overlap
    // if they were to overlap, one could not drag both labels again, but had to drag one a bit away first and then move the other
    let newValue = this.chart.current.chart.xAxis[0].toValue(
      Math.max(
        leftNeighbour + 1,
        Math.min(e.pageX + offset, rightNeighbour - 1)
      )
    );

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
    e.stopImmediatePropagation();
    console.log('event', e);
    switch (e.code) {
      // remove ternary condition if the fetching can be done instantaneously to enable continuous scrolling
      case 'ArrowRight':
        !e.repeat ? this.scroll(ScrollDirection.RIGHT) : (() => {})();
        break;
      case 'ArrowLeft':
        !e.repeat ? this.scroll(ScrollDirection.LEFT) : (() => {})();
        break;
    }
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
    const rightBoundInvisibleDummyPlotline = {
      id: -1,
      labelId: -1,
      value: this.props.end,
      className: 'plotline',
      zIndex: 3,
      width: 0,
      color: '#fff',
      isActive: false,
      isSelected: false,
      isPlotline: true,
      isLeftPlotline: false,
      isInvisible: true,
    };
    plotLines.push(rightBoundInvisibleDummyPlotline);

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
    var plotLine = plotLinesAndBands.filter(
      (item) => item.options.isPlotline && item.options.isActive
    )[0];

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
    const width = this.chart.current.chart.xAxis[0].max -this.chart.current.chart.xAxis[0].min + 1;
    const sign = direction === ScrollDirection.LEFT ? -1 : 1;
    this.chart.current.chart.xAxis[0].setExtremes(
      this.chart.current.chart.xAxis[0].min + sign * width * scrollFactor,
      this.chart.current.chart.xAxis[0].max + sign * width * scrollFactor
    );
  }

  zoom(direction) {
    const width = this.chart.current.chart.xAxis[0].max - this.chart.current.chart.xAxis[0].min + 1;
    const sign = direction === ZoomDirection.IN ? 1 : -1;
    this.chart.current.chart.xAxis[0].setExtremes(
      this.chart.current.chart.xAxis[0].min + sign * width * zoomFactor , 
      this.chart.current.chart.xAxis[0].max - sign * width * zoomFactor)
  }

  render() {
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
          <DropdownPanel
            fused={this.props.fused}
            start={this.props.start}
            offset={this.props.offset}
            onShift={this.props.onShift}
            onDelete={this.props.onDelete}
          />
        ) : null}
        {this.props.index !== 0 && !this.props.isEmpty ? (
          <div className='zoomMenuWrapper'>
              <button className="zoomBtn" style={{marginRight: '1px'}} onClick={e => this.zoom(ZoomDirection.OUT)}>
                <FontAwesomeIcon icon={faSearchMinus} size="xs" color="#999999" />
              </button>
              <button className="zoomBtn" onClick={e => this.zoom(ZoomDirection.IN)}>
                <FontAwesomeIcon icon={faSearchPlus} size="xs" color="#999999" />
              </button>
          </div>
        ) : null}
        <div className="chartWrapper" onMouseDown={this.onMouseDown}>
          <HighchartsReact
            ref={this.chart}
            highcharts={Highcharts}
            options={this.state.chartOptions}
            oneToOne={true}
            constructorType={'stockChart'}
          />
        </div>
      </div>
    );
  }
}
export default TimeSeriesPanel;
