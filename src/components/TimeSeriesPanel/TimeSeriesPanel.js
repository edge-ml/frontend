import React, { Component } from 'react';
import { Card, CardBody } from 'reactstrap';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import './TimeSeriesPanel.css';

const prefixLeftPlotLine = 'plotLine_left_';
const prefixRightPlotLine = 'plotLine_right_';

class TimeSeriesPanel extends Component {
  constructor(props) {
    super(props);

    this.chart = React.createRef();

    // global mouse handlers
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMoved = this.onMouseMoved.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    document.addEventListener('mousemove', this.onMouseMoved);
    document.addEventListener('mouseup', this.onMouseUp);

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

    this.getSecondBoundaryByPlotLineIdAndLabelId = this.getSecondBoundaryByPlotLineIdAndLabelId.bind(
      this
    );

    this.uuidv4 = this.uuidv4.bind(this);

    // state
    this.generateState = this.generateState.bind(this);
    this.state = this.generateState(props);
  }

  componentWillReceiveProps(props) {
    this.setState(state => this.generateState(props));
  }

  generateState(props) {
    let filteredLabels =
      props.labeling.labels !== undefined
        ? props.labeling.labels.filter(
            label => label.from === undefined || label.to === undefined
          )
        : undefined;
    let drawingId =
      filteredLabels !== undefined && filteredLabels.length !== 0
        ? filteredLabels[0].id
        : undefined;

    return {
      chartOptions: {
        navigator: {
          xAxis: {
            isInternal: true
          },
          yAxis: {
            isInternal: true
          }
        },
        rangeSelector: {
          enabled: false
        },
        panning: false,
        title: null,
        series: !Array.isArray(props.name)
          ? [
              {
                name: props.name,
                data: props.data
              }
            ]
          : props.data.map((dataItem, index) => {
              return { name: this.props.name[index], data: dataItem };
            }),
        xAxis: {
          type: 'datetime',
          ordinal: false,
          plotBands: this.labelingToPlotBands(
            props.labeling,
            props.labelTypes,
            props.selectedLabelId
          ),
          plotLines: this.labelingToPlotLines(
            props.labeling.labels,
            props.labelTypes,
            props.selectedLabelId
          ),
          crosshair: {
            snap: false
          },
          min: props.start,
          max: props.end,
          startOnTick: false,
          endOnTick: false,
          events: {
            afterSetExtremes: e => {
              if (this.chart.current.chart && Highcharts.charts) {
                Highcharts.charts
                  .filter(chart => {
                    return chart;
                  })
                  .forEach(chart => {
                    if (chart.index !== this.chart.current.chart.index) {
                      let ex = chart.xAxis[0].getExtremes();
                      if (ex.min !== e.min || ex.max !== e.max) {
                        chart.xAxis[0].setExtremes(e.min, e.max);
                      }
                    }
                  });
              }
            }
          }
        },
        yAxis: {
          title: {
            enabled: true,
            text: props.unit,
            style: {
              fontWeight: 'normal'
            }
          },
          opposite: false
        },
        legend: {
          align: 'right',
          verticalAlign: 'center',
          layout: 'vertical',
          x: 0,
          y: 0,
          enabled: true
        },
        tooltip: {
          enabled: false
        },
        scrollbar: {
          enabled: false
        }
      },
      labeling: props.labeling,
      labelTypes: props.labelTypes,
      selectedLabelId: props.selectedLabelId,
      onLabelClicked: props.onLabelClicked,
      onLabelChanged: props.onLabelChanged,
      controlStates: {
        activePlotLineId: !this.state
          ? undefined
          : this.state.controlStates.activePlotLineId,
        drawingId: drawingId,
        canEdit: props.canEdit
      }
    };
  }

  /***
   * Global Mouse Handlers
   */
  onMouseDown(e) {
    if (
      !(
        e.target.classList.contains('highcharts-background') ||
        e.target.classList.contains('highcharts-grid-line') ||
        e.target.classList.contains('highcharts-tracker-line')
      )
    )
      return;

    var plotBand = this.getSelectedPlotBand();
    if (plotBand) {
      this.onPlotBandMouseDown(
        e,
        plotBand.options.id,
        plotBand.options.labelId
      );
      return;
    } else {
      if (!this.state.controlStates.canEdit) return;

      let position = this.chart.current.chart.xAxis[0].toValue(
        e.pageX - this.chart.current.chart.plotBox.x / 2
      );
      let id;
      if (this.state.controlStates.drawingId) {
        id = this.state.controlStates.drawingId;
        this.setState({
          controlStates: {
            activePlotLineId: undefined,
            drawingId: undefined,
            canEdit: this.state.controlStates.canEdit
          }
        });
        this.state.onLabelChanged(id, position, undefined);
      } else {
        id = this.uuidv4();
        this.setState({
          controlStates: {
            activePlotLineId: undefined,
            drawingId: id,
            canEdit: this.state.controlStates.canEdit
          }
        });
        this.state.onLabelChanged(id, position, undefined);
      }
    }
    e.stopPropagation();
  }

  onMouseMoved(e) {
    var plotLine = this.getActivePlotLine();
    if (!plotLine) return;

    e.preventDefault();

    plotLine.svgElem.translate(e.pageX - plotLine.options.clickX, 0);

    let plotband = this.getPlotbandByLabelId(plotLine.options.labelId);
    let plotbandOptions = plotband.options;
    this.chart.current.chart.xAxis[0].removePlotBand(plotbandOptions.id);
    let draggedPosition = this.chart.current.chart.xAxis[0].toValue(
      e.pageX - this.chart.current.chart.plotBox.x / 2
    );
    let fixedPosition = plotLine.options.isLeftPlotline
      ? plotbandOptions.to
      : plotbandOptions.from; // TODO

    this.chart.current.chart.xAxis[0].addPlotBand({
      from: plotLine.options.isLeftPlotline ? draggedPosition : fixedPosition,
      to: plotLine.options.isLeftPlotline ? fixedPosition : draggedPosition,
      color: plotbandOptions.color,
      className: plotbandOptions.className,
      id: plotbandOptions.id,
      labelId: plotbandOptions.labelId,
      label: plotbandOptions.label,
      zIndex: plotbandOptions.zIndex,
      isSelected: plotbandOptions.isSelected
    });

    let newValue = this.chart.current.chart.xAxis[0].toValue(
      e.pageX - this.chart.current.chart.plotBox.x / 2
    );
    let remainingValue = this.getSecondBoundaryByPlotLineIdAndLabelId(
      plotLine.options.id,
      plotLine.options.labelId
    ).options.value;
    this.state.onLabelChanged(
      plotLine.options.labelId,
      newValue,
      remainingValue
    );
  }

  onMouseUp(e, id) {
    var plotLine = this.getActivePlotLine();
    if (!plotLine) return;

    this.setState({
      controlStates: {
        activePlotLineId: undefined,
        drawingId: this.state.controlStates.drawingId,
        canEdit: this.state.controlStates.canEdit
      }
    });

    plotLine.options.isActive = false;
    let newValue = this.chart.current.chart.xAxis[0].toValue(
      e.pageX - this.chart.current.chart.plotBox.x / 2
    );
    let remainingValue = this.getSecondBoundaryByPlotLineIdAndLabelId(
      plotLine.options.id,
      plotLine.options.labelId
    ).options.value;
    this.state.onLabelChanged(
      plotLine.options.labelId,
      newValue,
      remainingValue
    );
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
    return labeling.labels.map(label => ({
      id: 'band_' + label.id,
      labelId: label.id,
      from: label.from,
      to: label.to,
      zIndex: 2,
      className: selectedLabelId === label.id ? 'selected' : 'deselected',
      color: labelTypes.filter(labelType => labelType.id === label.typeId)[0]
        .color, // TODO: get rid of ugly code duplications
      label: {
        text: labelTypes.filter(labelType => labelType.id === label.typeId)[0]
          .name,
        style: {
          color: labelTypes.filter(
            labelType => labelType.id === label.typeId
          )[0].color,
          fontWeight: 'bold'
        },
        isPlotline: false,
        isSelected: selectedLabelId === label.id
      },
      events: {
        mousedown: e => mouseDownHandler(e, 'band_' + label.id, label.id)
      }
    }));
  }

  getPlotbandByLabelId(labelId) {
    if (!this.chart.current || !this.chart.current.chart) return;

    var plotLinesAndBands = this.chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotBand = plotLinesAndBands.filter(
      item => !item.options.isPlotline && item.options.labelId === labelId
    )[0];

    return plotBand;
  }

  getSelectedPlotBand() {
    if (!this.chart.current || !this.chart.current.chart) return;

    var plotBands = this.chart.current.chart.xAxis[0].plotLinesAndBands.filter(
      item => !item.options.isPlotline
    );
    var plotBand = plotBands.filter(
      item => item.options.className === 'selected'
    )[0];

    return plotBand;
  }

  /**
   * PlotLines
   */
  onPlotLineMouseDown(e, id) {
    if (!this.state.controlStates.canEdit) return;

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
        drawingId: this.state.controlStates.drawingId,
        canEdit: this.state.controlStates.canEdit
      }
    });
  }

  labelingToPlotLines(labels, labelTypes, selectedLabelId) {
    if (labels === undefined || labelTypes === undefined) return [];

    var plotLines = labels.reduce(
      (result, label) =>
        result.push(
          this.generatePlotLine(
            label.id,
            label.typeId,
            label.from,
            selectedLabelId === label.id,
            true,
            labelTypes
          ),
          this.generatePlotLine(
            label.id,
            label.typeId,
            label.to,
            selectedLabelId === label.id,
            false,
            labelTypes
          )
        ) && result,
      []
    );

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
      labelType => labelType.id === labelTypeId
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
        mousedown: e => mouseDownHandler(e, plotLineId, labelId)
      }
    };
  }

  uuidv4() {
    return 'xxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  getPlotLineById(id) {
    if (!this.chart.current || !this.chart.current.chart) return;

    var plotLinesAndBands = this.chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotLine = plotLinesAndBands.filter(
      item => item.options.isPlotline && item.options.id === id
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
      item => item.options.isPlotline && item.options.isActive
    )[0];

    return plotLine;
  }

  getSecondBoundaryByPlotLineIdAndLabelId(id, labelId) {
    if (!this.chart.current || !this.chart.current.chart) return;

    var plotLinesAndBands = this.chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotLine = plotLinesAndBands.filter(
      item =>
        item.options.isPlotline &&
        item.options.labelId === labelId &&
        item.options.id !== id
    )[0];

    return plotLine;
  }

  render() {
    return (
      <Card className="mt-3">
        <CardBody>
          <div id="chartWrapper" onMouseDown={this.onMouseDown}>
            <HighchartsReact
              ref={this.chart}
              highcharts={Highcharts}
              options={this.state.chartOptions}
              oneToOne={true}
              constructorType={'stockChart'}
            />
          </div>
        </CardBody>
      </Card>
    );
  }
}
export default TimeSeriesPanel;
