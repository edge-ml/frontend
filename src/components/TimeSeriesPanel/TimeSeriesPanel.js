import React, { Component } from 'react';
import { Card, CardBody } from 'reactstrap';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import './TimeSeriesPanel.css';

class TimeSeriesPanel extends Component {
  constructor(props) {
    super(props);

    this.chart = React.createRef();

    this.getPlotbandByLabelId = this.getPlotbandByLabelId.bind(this);
    this.getPlotLineById = this.getPlotLineById.bind(this);
    this.getActivePlotLine = this.getActivePlotLine.bind(this);
    this.getSecondBoundaryByPlotLineIdAndLabelId = this.getSecondBoundaryByPlotLineIdAndLabelId.bind(
      this
    );
    this.getSelectedPlotBand = this.getSelectedPlotBand.bind(this);
    this.labelingsToPlotBands = this.labelingsToPlotBands.bind(this);
    this.labelingsToLeftHandPlotLines = this.labelingsToLeftHandPlotLines.bind(
      this
    );
    this.labelingsToRightHandPlotLines = this.labelingsToRightHandPlotLines.bind(
      this
    );
    this.onPlotLineMouseDown = this.onPlotLineMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMoved = this.onMouseMoved.bind(this);
    this.onPlotBandMouseDown = this.onPlotBandMouseDown.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onPlotBandMouseOver = this.onPlotBandMouseOver.bind(this);
    this.onPlotBandMouseOut = this.onPlotBandMouseOut.bind(this);
    this.uuidv4 = this.uuidv4.bind(this);

    this.generateState = this.generateState.bind(this);
    this.state = this.generateState(props);

    document.addEventListener('mousemove', this.onMouseMoved);
    document.addEventListener('mouseup', this.onMouseUp);
  }

  componentWillReceiveProps(props) {
    this.setState(state => this.generateState(props));
  }

  generateState(props) {
    let filteredLabels = props.labeling.labels.filter(
      label => label.from === undefined || label.to === undefined
    );
    let drawingId =
      filteredLabels.length !== 0 ? filteredLabels[0].id : undefined;

    return {
      chartOptions: {
        rangeSelector: {
          enabled: false
        },
        panning: false,
        title: null,
        series: [
          {
            name: props.name,
            data: props.data
          }
        ],
        xAxis: {
          type: 'datetime',
          ordinal: false,
          plotBands: this.labelingsToPlotBands(
            props.labeling,
            props.labelTypes,
            props.selectedLabelId
          ),
          plotLines: this.labelingsToLeftHandPlotLines(
            props.labeling,
            props.labelTypes,
            props.selectedLabelId
          ).concat(
            this.labelingsToRightHandPlotLines(
              props.labeling,
              props.labelTypes,
              props.selectedLabelId
            )
          ),
          crosshair: {
            snap: false
          },
          min: props.start,
          max: props.end,
          startOnTick: false,
          endOnTick: false,
          events: {
            setExtremes: e => {
              console.log(e); // TODO
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

  labelingsToPlotBands(labeling, labelTypes, selectedLabelId) {
    var mouseDownHandler = this.onPlotBandMouseDown;
    var mouseOverHandler = this.onPlotBandMouseOver;
    var mouseOutHandler = this.onPlotBandMouseOut;

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
        mousedown: e => mouseDownHandler(e, 'band_' + label.id, label.id),
        mouseover: e => mouseOverHandler(label.id === selectedLabelId),
        mouseout: e => mouseOutHandler()
      }
    }));
  }

  labelingsToLeftHandPlotLines(labeling, labelTypes, selectedLabelId) {
    var mouseDownHandler = this.onPlotLineMouseDown;

    if (labeling.labels === undefined) return [];
    return labeling.labels.map(label => ({
      id: 'left_' + label.id,
      labelId: label.id,
      value: label.from,
      className: 'plotline',
      zIndex: 3,
      width: selectedLabelId === label.id ? 5 : 2,
      color: labelTypes.filter(labelType => labelType.id === label.typeId)[0]
        .color,
      isActive: !this.state
        ? false
        : this.state.controlStates.activePlotLineId === 'left_' + label.id,
      isSelected: selectedLabelId === label.id,
      isPlotline: true,
      isLeftPlotline: true,
      events: {
        mousedown: e => mouseDownHandler(e, 'left_' + label.id, label.id)
      }
    }));
  }

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

  onPlotBandMouseOver(isSelected) {
    // dragging
  }

  onPlotBandMouseOut() {
    // dragging
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

  uuidv4() {
    return 'xxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

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

  labelingsToRightHandPlotLines(labeling, labelTypes, selectedLabelId) {
    var mouseDownHandler = this.onPlotLineMouseDown;

    if (labeling.labels === undefined) return [];
    return labeling.labels.map(label => ({
      id: 'right_' + label.id,
      labelId: label.id,
      value: label.to,
      className: 'plotline',
      zIndex: 3,
      width: selectedLabelId === label.id ? 5 : 2,
      color: labelTypes.filter(labelType => labelType.id === label.typeId)[0]
        .color,
      isActive: !this.state
        ? false
        : this.state.controlStates.activePlotLineId === 'right_' + label.id,
      isSelected: selectedLabelId === label.id,
      isPlotline: true,
      isLeftPlotline: false,
      events: {
        mousedown: e => mouseDownHandler(e, 'right_' + label.id)
      }
    }));
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

  getPlotbandByLabelId(labelId) {
    if (!this.chart.current || !this.chart.current.chart) return;

    var plotLinesAndBands = this.chart.current.chart.xAxis[0].plotLinesAndBands;
    var plotBand = plotLinesAndBands.filter(
      item => !item.options.isPlotline && item.options.labelId === labelId
    )[0];

    return plotBand;
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
