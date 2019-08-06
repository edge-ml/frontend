import React, { Component } from 'react';
import { Col, Row, Fade, Button } from 'reactstrap';
import { view } from 'react-easy-state';
import Highcharts from 'highcharts/highstock';

import LabelingPanel from '../components/LabelingPanel/LabelingPanel';
import TagsPanel from '../components/TagsPanel/TagsPanel';
import ManagementPanel from '../components/ManagementPanel/ManagementPanel';
import MetadataPanel from '../components/MetadataPanel/MetadataPanel';
import InteractionControlPanel from '../components/InteractionControlPanel/InteractionControlPanel';
import LabelingSelectionPanel from '../components/LabelingSelectionPanel/LabelingSelectionPanel';
import TimeSeriesCollectionPanel from '../components/TimeSeriesCollectionPanel/TimeSeriesCollectionPanel';
import ApiPanel from '../components/ApiPanel/ApiPanel';
import CombineTimeSeriesModal from '../components/CombineTimeSeriesModal/CombineTimeSeriesModal';
import { uuidv4, shortId } from '../services/UUIDService';

import {
  subscribeLabelings,
  updateLabelings,
  unsubscribeLabelings,
  subscribeDataset,
  unsubscribeDataset
} from '../services/SocketService';
import { generateRandomColor } from '../services/ColorService';
import Loader from '../modules/loader';
import VideoPanel from '../components/VideoPanel/VideoPanel';

class DatasetPage extends Component {
  constructor(props) {
    let isSandbox = props.location.pathname === '/datasets/sandbox';

    var now = new Date().getTime();
    const dataset = isSandbox
      ? {
          id: 'sandbox',
          userId: 'sandboxUser',
          email: 'sand@box.com',
          start: now - 500000,
          end: now - 80000,
          tags: ['Sandbox Tag'],
          isPublished: false,
          timeSeries: [],
          labelings: [],
          fusedSeries: []
        }
      : {
          // TODO: pull real dataset
          /*
          id: '0x1234',
          userId: '0x9321',
          email: 'test@test.de',
          start: now - 500000,
          end: now - 80000,
          tags: ['Alcohol', 'Medication', 'Test', 'ABC'],
          isPublished: false,
          timeSeries: [
            {
              id: '0x123434',
              name: 'VOC',
              unit: 'kOhm',
              data: [
                [now - 500000, 20],
                [now - 400000, 40],
                [now - 300000, 60],
                [now - 200000, 10],
                [now - 140000, 15],
                [now - 100000, 30]
              ]
            },
            {
              id: '0x1123992',
              name: 'SPO2',
              unit: '%',
              data: [
                [now - 300000, 20],
                [now - 200000, 40],
                [now - 180000, 60],
                [now - 140000, 10],
                [now - 110000, 15],
                [now - 80000, 30]
              ]
            },
            {
              id: '0x12364774',
              name: 'EMG',
              unit: 'mV',
              data: [
                [now - 300000, 60],
                [now - 200000, 20],
                [now - 180000, 35],
                [now - 140000, 55],
                [now - 110000, 25],
                [now - 80000, 20]
              ]
            }
          ],
          fusedSeries: [],
          labelings: [
            {
              id: '0x3441234234',
              labelingId: 'e53325deda5e5b4',
              labels: [
                {
                  id: '1',
                  typeId: 'fa7b84e8-fe20-42dc-9eb3-4c2cc4a82031',
                  from: now - 450000,
                  to: now - 400000
                },
                {
                  id: '2',
                  typeId: '85e364fa-8b71-4ef4-bfec-f4b7344e777e',
                  from: now - 300000,
                  to: now - 200000
                }
              ]
            }
          ]
          */
        };

    super(props);
    this.state = {
      dataset: this.props.location.state.dataset
        ? this.props.location.state.dataset
        : dataset,
      labelingsDefinition: [],
      isReady: false,
      controlStates: {
        selectedLabelId: undefined,
        selectedLabelingId: undefined,
        selectedLabelTypeId: undefined,
        canEdit: false,
        drawingId: undefined,
        drawingPosition: undefined,
        newPosition: undefined
      },
      fuseTimeSeriesModalState: {
        isOpen: false
      }
    };

    this.onSelectedLabelingIdChanged = this.onSelectedLabelingIdChanged.bind(
      this
    );
    this.onSelectedLabelTypeIdChanged = this.onSelectedLabelTypeIdChanged.bind(
      this
    );
    this.onSelectedLabelChanged = this.onSelectedLabelChanged.bind(this);
    this.onLabelChanged = this.onLabelChanged.bind(this);
    this.onDeleteSelectedLabel = this.onDeleteSelectedLabel.bind(this);
    this.onCanEditChanged = this.onCanEditChanged.bind(this);
    this.addTimeSeries = this.addTimeSeries.bind(this);
    this.onFuseTimeSeries = this.onFuseTimeSeries.bind(this);
    this.onOpenFuseTimeSeriesModal = this.onOpenFuseTimeSeriesModal.bind(this);
    this.onLabelingsChanged = this.onLabelingsChanged.bind(this);
    this.onDatasetChanged = this.onDatasetChanged.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onFuseCanceled = this.onFuseCanceled.bind(this);
    this.clearKeyBuffer = this.clearKeyBuffer.bind(this);
    this.onScrubbed = this.onScrubbed.bind(this);
    this.onDeleteTimeSeries = this.onDeleteTimeSeries.bind(this);
    this.onShiftTimeSeries = this.onShiftTimeSeries.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.updateControlStates = this.updateControlStates.bind(this);
    this.setDrawingInterval = this.setDrawingInterval.bind(this);
    this.clearDrawingInterval = this.clearDrawingInterval.bind(this);
    this.setCrosshairInterval = this.setCrosshairInterval.bind(this);
    this.clearCrosshairInterval = this.clearCrosshairInterval.bind(this);

    this.pressedKeys = {
      num: [],
      ctrl: false,
      shift: false
    };

    this.videoPanel = React.createRef();
  }

  updateControlStates(drawingId, drawingPosition, newPosition, canEdit) {
    this.setState({
      controlStates: {
        selectedLabelId: this.state.controlStates.selectedLabelId,
        selectedLabelingId: this.state.controlStates.selectedLabelingId,
        selectedLabelTypeId: this.state.controlStates.selectedLabelTypeId,
        canEdit: canEdit,
        drawingId: drawingId,
        drawingPosition: drawingPosition,
        newPosition: newPosition
      }
    });
  }

  setDrawingInterval() {
    this.drawingInterval = setInterval(() => {
      let id = this.state.controlStates.drawingId;
      let position = this.state.controlStates.drawingPosition;
      if (!id || !position) return;
      let newPosition = this.state.controlStates.newPosition
        ? this.state.controlStates.newPosition + 500
        : position + 500;

      if (newPosition >= this.state.dataset.end) {
        this.clearDrawingInterval();
        return;
      }

      this.updateControlStates(
        id,
        position,
        newPosition,
        this.state.controlStates.canEdit
      );

      let difference = newPosition - this.state.dataset.start;
      this.onScrubbed(difference / 1000);

      this.onLabelChanged(id, position, newPosition);
    }, 10);
  }

  clearDrawingInterval() {
    clearInterval(this.drawingInterval);
    this.drawingInterval = false;

    this.updateControlStates(
      undefined,
      undefined,
      undefined,
      this.state.controlStates.canEdit
    );
  }

  onPlay() {
    if (!this.state.controlStates.canEdit) return;

    if (this.drawingInterval) {
      this.clearDrawingInterval();
      return;
    }

    let charts = Highcharts.charts;
    if (charts.length < 2) return;

    if (this.state.controlStates.selectedLabelId) {
      let labeling = this.state.dataset.labelings.filter(
        labeling =>
          labeling.labelingId === this.state.controlStates.selectedLabelingId
      )[0];

      let label = labeling.labels.filter(
        label => label['_id'] === this.state.controlStates.selectedLabelId
      )[0];

      this.updateControlStates(
        this.state.controlStates.selectedLabelId,
        label.start,
        label.end,
        this.state.controlStates.canEdit
      );
      this.setDrawingInterval();
    } else if (
      this.state.controlStates.drawingId &&
      this.state.controlStates.drawingPosition
    ) {
      this.setDrawingInterval();
    } else if (
      this.state.controlStates.drawingId &&
      !this.state.controlStates.drawingPosition
    ) {
      let id = this.state.controlStates.drawingId;

      let plotLinesAndBands = charts[1].xAxis[0].plotLinesAndBands;
      let plotLines = plotLinesAndBands.filter(item => item.options.isPlotline);
      if (plotLines.length === 0) return;

      let plotLine = plotLines[plotLines.length - 1];
      if (!plotLine.options.isLeftPlotline) return;
      let position = plotLine.options.value;

      this.updateControlStates(id, position, undefined, true);
      this.setDrawingInterval();
    } else if (!this.state.controlStates.drawingId) {
      let charts = Highcharts.charts;
      if (charts.length < 2) return;

      if (this.crosshairInterval) {
        let drawingPosition = this.state.controlStates.drawingPosition;
        this.clearCrosshairInterval();

        this.updateControlStates(uuidv4(), drawingPosition, undefined, true);
        this.setDrawingInterval();
      } else if (
        !charts[1].xAxis[0].plotLinesAndBands.some(
          plotline => plotline.id === 'plotline_cursor'
        )
      ) {
        charts.forEach((chart, index) => {
          if (index !== 0) {
            chart.xAxis[0].addPlotLine({
              value: this.state.dataset.start,
              id: 'plotline_cursor',
              dashStyle: 'ShortDot',
              width: 2,
              color: '#bfbfbf'
            });
          }
        });

        this.updateControlStates(
          undefined,
          this.state.dataset.start + 500,
          undefined,
          this.state.controlStates.canEdit
        );
        this.setCrosshairInterval();
      }
    }
  }

  clearCrosshairInterval() {
    clearInterval(this.crosshairInterval);
    this.crosshairInterval = false;

    this.updateControlStates(
      undefined,
      undefined,
      undefined,
      this.state.controlStates.canEdit
    );

    let charts = Highcharts.charts;
    charts.forEach((chart, index) => {
      if (index !== 0) {
        chart.xAxis[0].removePlotLine('plotline_cursor');
      }
    });
  }

  setCrosshairInterval() {
    let charts = Highcharts.charts;
    if (charts.length < 2) return;

    this.crosshairInterval = setInterval(() => {
      let position = this.state.controlStates.drawingPosition;
      if (position >= this.state.dataset.end) {
        this.clearCrosshairInterval();
        return;
      }

      charts.forEach((chart, index) => {
        if (index !== 0) {
          chart.xAxis[0].removePlotLine('plotline_cursor');
          chart.xAxis[0].addPlotLine({
            value: position,
            id: 'plotline_cursor',
            dashStyle: 'ShortDot',
            width: 2,
            color: '#bfbfbf'
          });
        }
      });

      this.updateControlStates(
        undefined,
        position + 500,
        undefined,
        this.state.controlStates.canEdit
      );

      let difference = position + 500 - this.state.dataset.start;
      this.onScrubbed(difference / 1000);
    }, 10);
  }

  clearKeyBuffer() {
    this.pressedKeys.num = [];
    this.pressedKeys.ctrl = false;
    this.pressedKeys.shift = false;
  }

  onKeyDown(e) {
    let keyCode = e.keyCode ? e.keyCode : e.which;

    if ((e.ctrlKey || e.shiftKey) && keyCode > 47 && keyCode < 58) {
      e.preventDefault();

      this.pressedKeys.ctrl = e.ctrlKey;
      this.pressedKeys.shift = e.shiftKey;

      this.pressedKeys.num.push(keyCode - 48);

      if (this.pressedKeys.ctrl && this.pressedKeys.shift) {
        let index =
          this.pressedKeys.num.reduce((total, current, index) => {
            return (
              total +
              current * Math.pow(10, this.pressedKeys.num.length - index - 1)
            );
          }, 0) - 1;

        if (index >= 0 && index < this.state.labelingsDefinition.length) {
          this.onSelectedLabelingIdChanged(
            this.state.labelingsDefinition[index].id
          );
        } else {
          while (
            index >= this.state.labelingsDefinition.length &&
            this.pressedKeys.num.length > 1
          ) {
            this.pressedKeys.num.shift();
            index =
              this.pressedKeys.num.reduce((total, current, index) => {
                return (
                  total +
                  current *
                    Math.pow(10, this.pressedKeys.num.length - index - 1)
                );
              }, 0) - 1;
          }

          if (index >= this.state.labelingsDefinition.length || index < 0) {
            this.clearKeyBuffer();
          } else {
            this.onSelectedLabelingIdChanged(
              this.state.labelingsDefinition[index].id
            );
          }
        }
      } else if (this.pressedKeys.ctrl && !this.pressedKeys.shift) {
        let index =
          this.pressedKeys.num.reduce((total, current, index) => {
            return (
              total +
              current * Math.pow(10, this.pressedKeys.num.length - index - 1)
            );
          }, 0) - 1;
        let controlStates = this.state.controlStates;

        if (
          controlStates.selectedLabelingId &&
          controlStates.selectedLabelTypeId
        ) {
          if (controlStates.canEdit) {
            let labeling = this.state.labelingsDefinition.filter(labeling => {
              return labeling.id === controlStates.selectedLabelingId;
            })[0];

            if (index >= 0 && index < labeling.types.length) {
              this.onSelectedLabelTypeIdChanged(labeling.types[index].id);
            } else {
              while (
                index >= labeling.types.length &&
                this.pressedKeys.num.length > 1
              ) {
                this.pressedKeys.num.shift();
                index =
                  this.pressedKeys.num.reduce((total, current, index) => {
                    return (
                      total +
                      current *
                        Math.pow(10, this.pressedKeys.num.length - index - 1)
                    );
                  }, 0) - 1;
              }

              if (index >= labeling.types.length || index < 0) {
                this.clearKeyBuffer();
              } else {
                this.onSelectedLabelTypeIdChanged(labeling.types[index].id);
              }
            }
          } else {
            window.alert('Editing not unlocked. Press "L" to unlock.');
            this.clearKeyBuffer();
          }
        } else if (!controlStates.selectedLabelTypeId) {
          window.alert('No label selected.');
          this.clearKeyBuffer();
        }
      }

      // l
    } else if (keyCode === 76) {
      e.preventDefault();
      this.onCanEditChanged(!this.state.controlStates.canEdit);

      // backspace or delete
    } else if (keyCode === 8 || keyCode === 46) {
      e.preventDefault();
      let controlStates = this.state.controlStates;
      if (
        controlStates.selectedLabelingId &&
        controlStates.selectedLabelTypeId
      ) {
        if (controlStates.canEdit) {
          this.onDeleteSelectedLabel();
        } else {
          window.alert('Editing not unlocked. Press "L" to unlock.');
        }
      }

      // space
    } else if (keyCode === 32) {
      e.preventDefault();
      this.onPlay();
    }
  }

  onKeyUp(e) {
    let keyCode = e.keyCode ? e.keyCode : e.which;

    // shift
    if (keyCode === 16) {
      e.preventDefault();
      this.clearKeyBuffer();

      // ctrl
    } else if (keyCode === 17) {
      e.preventDefault();

      if (this.pressedKeys.ctrl && !this.pressedKeys.shift) {
        this.clearKeyBuffer();
      }
    }
  }

  onScrubbed(position) {
    if (!this.videoPanel.current) return;

    this.videoPanel.current.onSetTime(position);
  }

  onDatasetChanged(dataset) {
    if (!dataset) return;

    dataset.fusedSeries = dataset.fusedSeries.filter(
      fused => fused.timeSeries.length > 1
    );
    this.setState(
      { dataset: dataset },
      subscribeLabelings(this.onLabelingsChanged)
    );
  }

  onLabelingsChanged(labelings) {
    if (!labelings) labelings = [];

    let dataset = JSON.parse(JSON.stringify(this.state.dataset));

    let labelingsChanged = false;
    dataset.labelings.forEach(labeling => {
      if (!labelings.some(def => def.id === labeling.labelingId)) {
        let types = [];
        labeling.labels.forEach(label => {
          if (!types.some(type => type.id === label.type)) {
            types = [
              ...types,
              {
                id: label.type,
                name: 'Type ' + shortId(),
                color: generateRandomColor()
              }
            ];
          }
        });

        labelings = [
          ...labelings,
          {
            id: labeling.labelingId,
            name: 'Labeling ' + shortId(),
            types: types
          }
        ];
        labelingsChanged = true;
      } else {
        let def = labelings.filter(def => def.id === labeling.labelingId)[0];

        labeling.labels.forEach(label => {
          if (!def.types.some(type => type.id === label.type)) {
            def.types.push({
              id: label.type,
              name: 'Type ' + shortId(),
              color: generateRandomColor()
            });
            labelingsChanged = true;
          }
        });
      }
    });

    labelings.forEach(def => {
      if (
        !this.state.dataset.labelings.some(
          labeling => labeling.labelingId === def.id
        )
      ) {
        dataset.labelings.push({
          _id: uuidv4(),
          labelingId: def.id,
          labels: []
        });
      }
    });

    this.setState({
      dataset: dataset,
      labelingsDefinition: labelings,
      controlStates: {
        selectedLabelId: this.state.controlStates.selectedLabelId,
        selectedLabelingId: labelings[0].id,
        selectedLabelTypeId: this.state.controlStates.selectedLabelTypeId,
        canEdit: this.state.controlStates.canEdit,
        drawingId: this.state.controlStates.drawingId,
        drawingPosition: this.state.controlStates.drawingPosition,
        newPosition: this.state.controlStates.newPosition
      },
      isReady: true
    });

    if (labelingsChanged) {
      updateLabelings(labelings);
    }
  }

  componentDidMount() {
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('keydown', this.onKeyDown);
    subscribeDataset(this.props.match.params.id, this.onDatasetChanged);
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('keydown', this.onKeyDown);
    unsubscribeLabelings();
    unsubscribeDataset(this.props.match.params.id);
  }

  addTimeSeries(obj) {
    let dataset = JSON.parse(JSON.stringify(this.state.dataset));

    let labels = JSON.parse(JSON.stringify(obj.labels));
    obj.labels = undefined;
    obj.offset = 0;
    obj.data = obj.data.map(point => {
      return {
        _id: uuidv4(),
        timestamp: point[0],
        value: point[1]
      };
    });
    dataset.timeSeries.push(obj);

    labels = labels.filter(label => {
      let labelingsDefinition = this.state.labelingsDefinition;
      for (let j = 0; j < labelingsDefinition.length; j++) {
        if (label.labelingId === labelingsDefinition[j].id) {
          if (
            !labelingsDefinition[j].types.some(type => type.id === label.type)
          ) {
            window.alert(
              `The typeId ${label.typeId} does not match any defined label type of labeling ${label.labelingId}.`
            );
            return;
          }

          for (let i = 0; i < dataset.labelings.length; i++) {
            if (dataset.labelings[i].labelingId === label.labelingId) {
              dataset.labelings[i].labels.push({
                _id: uuidv4(),
                type: label.type,
                start: label.start,
                end: label.end
              });
              break;
            }
          }
          break;
        }
      }
    });

    if (labels.length !== 0) {
      window.alert(
        `The labelingId ${labels[0].labelingId} does not match any defined labeling.`
      );
      return;
    }

    dataset.end = Math.max(
      obj.data[obj.data.length - 1].timestamp,
      dataset.end
    );
    dataset.start = Math.min(obj.data[0].timestamp, dataset.start);
    this.setState({ dataset });
  }

  onSelectedLabelingIdChanged(selectedLabelingId) {
    this.setState({
      controlStates: {
        selectedLabelId: undefined,
        selectedLabelingId: selectedLabelingId,
        selectedLabelTypeId: undefined,
        canEdit: this.state.controlStates.canEdit,
        drawingId: this.state.controlStates.drawingId,
        drawingPosition: this.state.controlStates.drawingPosition,
        newPosition: this.state.controlStates.newPosition
      }
    });
  }

  onSelectedLabelTypeIdChanged(selectedLabelTypeId) {
    if (this.state.controlStates.selectedLabelId === undefined) return;

    // TODO: wtf - all this filter has to be improved
    let labeling = this.state.dataset.labelings.filter(
      labeling =>
        labeling.labelingId === this.state.controlStates.selectedLabelingId
    )[0];
    let label = labeling.labels.filter(
      label => label['_id'] === this.state.controlStates.selectedLabelId
    )[0];
    var selectedLabeling = this.state.labelingsDefinition.filter(
      labeling => labeling.id === this.state.controlStates.selectedLabelingId
    )[0];
    var selectedLabelingTypes = selectedLabeling.types;
    label.type = selectedLabelingTypes.filter(
      labelType => labelType.id === selectedLabelTypeId
    )[0].id;

    this.setState({
      controlStates: {
        selectedLabelId: this.state.controlStates.selectedLabelId,
        selectedLabelingId: this.state.controlStates.selectedLabelingId,
        selectedLabelTypeId: selectedLabelTypeId,
        canEdit: this.state.controlStates.canEdit,
        drawingId: this.state.controlStates.drawingId,
        drawingPosition: this.state.controlStates.drawingPosition,
        newPosition: this.state.controlStates.newPosition
      }
    });
  }

  onSelectedLabelChanged(selectedLabelId) {
    let labeling = this.state.dataset.labelings.filter(
      labeling =>
        labeling.labelingId === this.state.controlStates.selectedLabelingId
    )[0];
    let label = labeling.labels.filter(
      label => label['_id'] === selectedLabelId
    )[0];
    this.setState({
      controlStates: {
        selectedLabelId: selectedLabelId,
        selectedLabelingId: this.state.controlStates.selectedLabelingId,
        selectedLabelTypeId: label ? label.type : undefined,
        canEdit: this.state.controlStates.canEdit,
        drawingId: this.state.controlStates.drawingId,
        drawingPosition: this.state.controlStates.drawingPosition,
        newPosition: this.state.controlStates.newPosition
      }
    });
  }

  onLabelChanged(labelId, start, end) {
    let labeling = this.state.dataset.labelings.filter(
      labeling =>
        labeling.labelingId === this.state.controlStates.selectedLabelingId
    )[0];

    let label = labeling.labels.filter(label => label['_id'] === labelId)[0];

    if (label !== undefined && label.start === undefined) {
      label.start = start === undefined ? start : end;
    } else if (label !== undefined && label.to === undefined) {
      label.end = start === undefined ? start : end;
    } else if (!label) {
      label = {
        _id: labelId,
        start: start,
        end: end,
        type: this.state.labelingsDefinition.filter(
          labeling =>
            this.state.controlStates.selectedLabelingId === labeling.id
        )[0].types[0].id
      };
      labeling.labels = [...labeling.labels, label];
    } else {
      label.start = start;
      label.end = end;
    }

    let temp;
    if (label.start > label.end) {
      temp = label.start;
      label.start = label.end;
      label.end = temp;
    }

    this.forceUpdate();
  }

  onDeleteSelectedLabel() {
    if (window.confirm('Are you sure to delete this label?')) {
      let labeling = this.state.dataset.labelings.filter(
        labeling =>
          labeling.labelingId === this.state.controlStates.selectedLabelingId
      )[0];
      labeling.labels = labeling.labels.filter(
        label => label['_id'] !== this.state.controlStates.selectedLabelId
      );
      this.setState({
        controlStates: {
          selectedLabelId: undefined,
          selectedLabelingId: this.state.controlStates.selectedLabelingId,
          selectedLabelTypeId: undefined,
          canEdit: this.state.controlStates.canEdit,
          drawingId: this.state.controlStates.drawingId,
          drawingPosition: this.state.controlStates.drawingPosition,
          newPosition: this.state.controlStates.newPosition
        }
      });
    }
  }

  onCanEditChanged(canEdit) {
    if (!this.drawingInterval) {
      this.setState({
        controlStates: {
          selectedLabelId: this.state.controlStates.selectedLabelId,
          selectedLabelingId: this.state.controlStates.selectedLabelingId,
          selectedLabelTypeId: this.state.controlStates.selectedLabelTypeId,
          canEdit: canEdit,
          drawingId: this.state.controlStates.drawingId,
          drawingPosition: this.state.controlStates.drawingPosition,
          newPosition: this.state.controlStates.newPosition
        }
      });
    }
  }

  onFuseTimeSeries(seriesIds) {
    let dataset = JSON.parse(JSON.stringify(this.state.dataset));
    dataset.fusedSeries.push({
      _id: uuidv4(),
      timeSeries: seriesIds
    });
    let fuseTimeSeriesModalState = { ...this.state.fuseTimeSeriesModalState };
    fuseTimeSeriesModalState.isOpen = false;

    this.setState({ dataset });
    this.setState({ fuseTimeSeriesModalState });
  }

  onFuseCanceled() {
    let fuseTimeSeriesModalState = { ...this.state.fuseTimeSeriesModalState };
    fuseTimeSeriesModalState.isOpen = false;

    this.setState({ fuseTimeSeriesModalState });
  }

  onOpenFuseTimeSeriesModal() {
    let fuseTimeSeriesModalState = { ...this.state.fuseTimeSeriesModalState };
    fuseTimeSeriesModalState.isOpen = true;

    this.setState({ fuseTimeSeriesModalState });
  }

  onDeleteTimeSeries(fused, index) {
    let dataset = JSON.parse(JSON.stringify(this.state.dataset));

    if (!fused) {
      dataset.fusedSeries.forEach(series => {
        series.timeSeries = series.timeSeries.filter(
          timeSeries => timeSeries !== dataset.timeSeries[index]['_id']
        );
      });
      dataset.timeSeries.splice(index, 1);
      dataset.start = this.getStartTime(dataset.timeSeries);
      dataset.end = this.getEndTime(dataset.timeSeries);
      dataset.fusedSeries = dataset.fusedSeries.filter(
        series => series.timeSeries.length > 1
      );
    } else {
      dataset.fusedSeries.splice(index, 1);
    }

    this.setState({ dataset });
  }

  onShiftTimeSeries(index, timestamp) {
    let dataset = JSON.parse(JSON.stringify(this.state.dataset));

    let data = dataset.timeSeries[index].data;
    let diff = timestamp - data[0].timestamp;
    data.forEach(element => {
      element.timestamp = element.timestamp + diff;
    });
    dataset.timeSeries[index].data = data;

    dataset.start = this.getStartTime(dataset.timeSeries);
    dataset.end = this.getEndTime(dataset.timeSeries);

    this.setState({ dataset });
  }

  getStartTime(timeSeries) {
    if (timeSeries.length === 0) {
      let now = new Date().getTime();
      return now - 500000; // TODO
    }

    let startTimes = [];

    timeSeries.forEach(element => {
      startTimes.push(element.data[0].timestamp);
    });

    return Math.min(...startTimes);
  }

  getEndTime(timeSeries) {
    if (timeSeries.length === 0) {
      let now = new Date().getTime();
      return now - 80000; // TODO
    }

    let endTimes = [];

    timeSeries.forEach(element => {
      endTimes.push(element.data[element.data.length - 1].timestamp);
    });

    return Math.max(...endTimes);
  }

  render() {
    if (!this.state.isReady) return <Loader loading={true} />;

    var selectedLabeling = this.state.labelingsDefinition.filter(
      labeling => labeling.id === this.state.controlStates.selectedLabelingId
    )[0];
    var selectedLabelingTypes = selectedLabeling.types;
    var labeling = this.state.dataset.labelings.filter(
      labeling => selectedLabeling.id === labeling.labelingId
    )[0];
    if (labeling === undefined) labeling = [];
    let label = labeling.labels
      ? labeling.labels.filter(
          label => label['_id'] === this.state.controlStates.selectedLabelId
        )[0]
      : null;

    let isDrawingIntervalActive = this.drawingInterval ? true : false;
    let isCrosshairIntervalActive = this.crosshairInterval ? true : false;

    return (
      <Fade in={this.state.fadeIn}>
        <div className="pb-5">
          <Row className="pt-3">
            <Col
              onMouseUp={this.mouseUpHandler}
              xs={12}
              lg={9}
              className="pr-lg-0"
            >
              <div
                style={{
                  paddingBottom: '86px'
                }}
              >
                <LabelingSelectionPanel
                  history={this.props.history}
                  labelingsDefinition={this.state.labelingsDefinition}
                  selectedLabelingId={
                    this.state.controlStates.selectedLabelingId
                  }
                  onSelectedLabelingIdChanged={this.onSelectedLabelingIdChanged}
                />
                <TimeSeriesCollectionPanel
                  timeSeries={this.state.dataset.timeSeries}
                  fusedSeries={this.state.dataset.fusedSeries}
                  labeling={labeling}
                  labelTypes={selectedLabelingTypes}
                  onLabelClicked={this.onSelectedLabelChanged}
                  selectedLabelId={this.state.controlStates.selectedLabelId}
                  start={this.state.dataset.start}
                  end={this.state.dataset.end}
                  onLabelChanged={this.onLabelChanged}
                  canEdit={this.state.controlStates.canEdit}
                  onScrubbed={this.onScrubbed}
                  onShift={this.onShiftTimeSeries}
                  onDelete={this.onDeleteTimeSeries}
                  drawingId={this.state.controlStates.drawingId}
                  drawingPosition={this.state.controlStates.drawingPosition}
                  newPosition={this.state.controlStates.newPosition}
                  updateControlStates={this.updateControlStates}
                  clearDrawingInterval={this.clearDrawingInterval}
                  drawingInterval={this.drawingInterval}
                />
                <Button
                  block
                  outline
                  onClick={this.onOpenFuseTimeSeriesModal}
                  style={{ zIndex: 1, position: 'relative' }}
                >
                  + Fuse Multiple Time Series
                </Button>
              </div>
            </Col>
            <Col xs={12} lg={3}>
              <div>
                <VideoPanel ref={this.videoPanel} />
              </div>
              <div className="mt-0">
                <InteractionControlPanel
                  isPublished={this.state.dataset.isPublished}
                />
              </div>
              <div className="mt-2">
                <TagsPanel events={this.state.dataset.events} />
              </div>
              <div className="mt-2">
                <MetadataPanel
                  id={this.state.dataset['_id']}
                  start={this.state.dataset.start}
                  end={this.state.dataset.end}
                  user={this.state.dataset.userId}
                />
              </div>
              <div className="mt-2">
                <ApiPanel
                  onUpload={obj => this.addTimeSeries(obj)}
                  onFuse={this.onFuseTimeSeries}
                  startTime={this.state.dataset.start}
                />
              </div>
              <div className="mt-2" style={{ marginBottom: '230px' }}>
                <ManagementPanel
                  onUpload={obj => this.addTimeSeries(obj)}
                  startTime={this.state.dataset.start}
                />
              </div>
            </Col>
            <Col xs={12}>
              <LabelingPanel
                history={this.props.history}
                id={this.state.controlStates.selectedLabelId}
                from={label ? label.start : null}
                to={label ? label.end : null}
                labeling={selectedLabeling}
                selectedLabelTypeId={
                  this.state.controlStates.selectedLabelTypeId
                }
                onSelectedLabelTypeIdChanged={this.onSelectedLabelTypeIdChanged}
                onDeleteSelectedLabel={this.onDeleteSelectedLabel}
                onCanEditChanged={this.onCanEditChanged}
                canEdit={this.state.controlStates.canEdit}
                onPlay={this.onPlay}
                isDrawingIntervalActive={isDrawingIntervalActive}
                isCrosshairIntervalActive={isCrosshairIntervalActive}
              />
            </Col>
            <Col />
            <CombineTimeSeriesModal
              timeSeries={this.state.dataset.timeSeries}
              onFuse={this.onFuseTimeSeries}
              onFuseCanceled={this.onFuseCanceled}
              isOpen={this.state.fuseTimeSeriesModalState.isOpen}
            />
          </Row>
        </div>
      </Fade>
    );
  }
}

export default view(DatasetPage);
