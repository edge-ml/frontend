import React, { Component } from 'react';
import { Col, Row, Fade, Button } from 'reactstrap';
import Highcharts from 'highcharts/highstock';

import LabelingPanel from '../components/LabelingPanel/LabelingPanel';
import ManagementPanel from '../components/ManagementPanel/ManagementPanel';
import MetadataPanel from '../components/MetadataPanel/MetadataPanel';
import LabelingSelectionPanel from '../components/LabelingSelectionPanel/LabelingSelectionPanel';
import TimeSeriesCollectionPanel from '../components/TimeSeriesCollectionPanel/TimeSeriesCollectionPanel';
import CombineTimeSeriesModal from '../components/CombineTimeSeriesModal/CombineTimeSeriesModal';

import { subscribeLabelingsAndLabels } from '../services/ApiServices/LabelingServices';
import {
  updateDataset,
  deleteDataset,
  getDataset
} from '../services/ApiServices/DatasetServices';
import Loader from '../modules/loader';
import VideoPanel from '../components/VideoPanel/VideoPanel';
import { getRandomInt } from '../services/helpers';

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
      : null;

    super(props);
    this.state = {
      dataset: this.props.location.state
        ? this.props.location.state.dataset
        : dataset,
      labelings: [],
      labels: [],
      isReady: false,
      controlStates: {
        selectedLabelId: undefined,
        selectedLabelingId: undefined,
        selectedLabelTypeId: undefined,
        selectedLabelTypes: undefined,
        canEdit: false,
        drawingId: undefined,
        drawingPosition: undefined,
        newPosition: undefined,
        fromLastPosition: false
      },
      fuseTimeSeriesModalState: {
        isOpen: false
      },
      modalOpen: false
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
    this.onLabelingsAndLabelsChanged = this.onLabelingsAndLabelsChanged.bind(
      this
    );
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
    this.onDeleteDataset = this.onDeleteDataset.bind(this);
    this.onDatasetUpdated = this.onDatasetUpdated.bind(this);
    this.setModalOpen = this.setModalOpen.bind(this);
    this.onAddLabeling = this.onAddLabeling.bind(this);
    this.onSetName = this.onSetName.bind(this);
    this.onSetUnit = this.onSetUnit.bind(this);
    this.onSetAllUnit = this.onSetAllUnit.bind(this);
    this.onSetAllName = this.onSetAllName.bind(this);
    this.pressedKeys = {
      num: [],
      ctrl: false,
      shift: false
    };
  }

  onSetName(index, newName) {
    const dataset = this.state.dataset;
    dataset.timeSeries[index - 1].name = newName;
    updateDataset(dataset).then(newDataset => {
      this.setState({
        dataset: newDataset
      });
    });
  }

  onSetUnit(index, newUnit) {
    const dataset = this.state.dataset;
    dataset.timeSeries[index - 1].unit = newUnit;
    updateDataset(dataset).then(newDataset => {
      this.setState({
        dataset: newDataset
      });
    });
  }

  onSetAllName(newName) {
    const dataset = this.state.dataset;
    for (var i = 0; i < dataset.timeSeries.length; i++) {
      dataset.timeSeries[i].name = newName;
    }
    updateDataset(dataset).then(newDataset => {
      this.setState({
        dataset: newDataset
      });
    });
  }

  onSetAllUnit(newUnit) {
    const dataset = this.state.dataset;
    for (var i = 0; i < dataset.timeSeries.length; i++) {
      dataset.timeSeries[i].unit = newUnit;
    }
    updateDataset(dataset).then(newDataset => {
      this.setState({
        dataset: newDataset
      });
    });
  }

  onAddLabeling() {
    const newHistory = this.props.history.location.pathname.split('/');
    newHistory.length -= 2;

    this.props.history.push({
      pathname: newHistory.join('/') + '/labelings/new'
    });
  }

  setModalOpen(isOpen) {
    this.setState({
      modalOpen: isOpen
    });
  }

  componentDidMount() {
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('keydown', this.onKeyDown);
    getDataset(this.props.match.params.id).then(this.onDatasetChanged);
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onDatasetUpdated() {
    getDataset(this.props.match.params.id).then(this.onDatasetChanged);
  }

  onDatasetChanged(dataset) {
    if (!dataset) return;

    dataset.fusedSeries = dataset.fusedSeries.filter(
      fused => fused.timeSeries.length > 1
    );
    this.setState({ dataset }, () =>
      subscribeLabelingsAndLabels().then(result => {
        this.onLabelingsAndLabelsChanged(result.labelings, result.labels);
      })
    );
  }

  onLabelingsAndLabelsChanged(labelings, labels) {
    let selectedLabeling = labelings[0];
    let selectedLabelTypes = undefined;
    if (labels) {
      if (selectedLabeling) {
        selectedLabelTypes = labels.filter(label =>
          selectedLabeling.labels.includes(label['_id'])
        );
      }
    }

    this.setState({
      labelings: labelings || [],
      labels: labels || [],
      controlStates: {
        ...this.state.controlStates,
        selectedLabelingId: selectedLabeling
          ? selectedLabeling['_id']
          : undefined,
        selectedLabelTypes: selectedLabelTypes
      },
      isReady: true
    });
  }

  onKeyDown(e) {
    if (this.state.modalOpen) {
      return;
    }
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

        if (index >= 0 && index < this.state.labelings.length) {
          this.onSelectedLabelingIdChanged(this.state.labelings[index]['_id']);
        } else {
          while (
            index >= this.state.labelings.length &&
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

          if (index >= this.state.labelings.length || index < 0) {
            this.clearKeyBuffer();
          } else {
            this.onSelectedLabelingIdChanged(
              this.state.labelings[index]['_id']
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
            let labeling = this.state.labelings.filter(labeling => {
              return labeling['_id'] === controlStates.selectedLabelingId;
            })[0];

            let labels = this.state.labels.filter(label =>
              labeling.labels.includes(label['_id'])
            );

            if (index >= 0 && index < labels.length) {
              this.onSelectedLabelTypeIdChanged(labels[index]['_id']);
            } else {
              while (
                index >= labels.length &&
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

              if (index >= labels.length || index < 0) {
                this.clearKeyBuffer();
              } else {
                this.onSelectedLabelTypeIdChanged(labels[index]['_id']);
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
      if (this.state.playButtonEnabled) {
        e.preventDefault();
        this.onPlay();
      }
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

  clearKeyBuffer() {
    this.pressedKeys.num = [];
    this.pressedKeys.ctrl = false;
    this.pressedKeys.shift = false;
  }

  addTimeSeries(obj) {
    let dataset = JSON.parse(JSON.stringify(this.state.dataset));

    let labels = JSON.parse(JSON.stringify(obj.labels));
    obj.labels = undefined;
    obj.offset = 0;
    obj.data = obj.data.map(point => {
      return {
        timestamp: point[0],
        value: point[1]
      };
    });
    dataset.timeSeries.push(obj);

    labels = labels.filter(label => {
      let labelings = this.state.labelings;

      for (let j = 0; j < labelings.length; j++) {
        let labelTypes = this.state.labels.filter(labelType =>
          labelings[j].labels.includes(labelType['_id'])
        );

        if (label.labelingId === labelings[j]['_id']) {
          if (!labelTypes.some(type => type['_id'] === label.typeId)) {
            window.alert(
              `The typeId ${label.typeId} does not match any defined label type of labeling ${label.labelingId}.`
            );
            return null;
          }

          for (let i = 0; i < dataset.labelings.length; i++) {
            if (dataset.labelings[i].labelingId === label.labelingId) {
              dataset.labelings[i].labels.push({
                type: label.typeId,
                start: label.start,
                end: label.end
              });
              break;
            }
          }
          break;
        }
      }
      return null;
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

    updateDataset(dataset).then(dataset => {
      this.setState({ dataset });
    });
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
      dataset.fusedSeries = dataset.fusedSeries.filter(
        series => series.timeSeries.length > 1
      );
    } else {
      dataset.fusedSeries.splice(index, 1);
    }

    updateDataset(dataset).then(newDataset => {
      this.setState({
        dataset: newDataset
      });
    });
  }

  onShiftTimeSeries(index, timestamp) {
    let dataset = JSON.parse(JSON.stringify(this.state.dataset));

    let diff = timestamp - (dataset.start + dataset.timeSeries[index].offset);
    dataset.timeSeries[index].offset += diff;

    updateDataset(dataset).then(newDataset => {
      this.setState({
        dataset: newDataset
      });
    });
  }

  onFuseTimeSeries(seriesIds) {
    let dataset = JSON.parse(JSON.stringify(this.state.dataset));
    dataset.fusedSeries.push({
      timeSeries: seriesIds
    });

    updateDataset(dataset).then(dataset => {
      this.setState({
        dataset,
        fuseTimeSeriesModalState: { isOpen: false }
      });
    });
  }

  onFuseCanceled() {
    this.setState({ fuseTimeSeriesModalState: { isOpen: false } });
  }

  onOpenFuseTimeSeriesModal() {
    this.setState({ fuseTimeSeriesModalState: { isOpen: true } });
  }

  updateControlStates(
    drawingId,
    drawingPosition,
    newPosition,
    canEdit,
    fromLastPosition = this.state.controlStates.fromLastPosition
  ) {
    this.setState({
      controlStates: {
        ...this.state.controlStates,
        canEdit: canEdit,
        drawingId: drawingId,
        drawingPosition: drawingPosition,
        newPosition: newPosition,
        fromLastPosition: fromLastPosition
      }
    });
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
        this.state.controlStates.canEdit,
        false
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

      this.updateControlStates(id, position, undefined, true, false);
      this.setDrawingInterval();
    } else if (!this.state.controlStates.drawingId) {
      let charts = Highcharts.charts;
      if (charts.length < 2) return;

      if (this.crosshairInterval) {
        let drawingPosition = this.state.controlStates.drawingPosition;
        this.clearCrosshairInterval();

        this.updateControlStates(null, drawingPosition, undefined, true, true);
        this.setDrawingInterval();
      } else if (
        !charts[1].xAxis[0].plotLinesAndBands.some(
          plotline => plotline.id === 'plotline_cursor'
        )
      ) {
        let position;
        if (this.state.controlStates.drawingPosition) {
          position = this.state.controlStates.drawingPosition;
        } else {
          position = this.state.dataset.start;
        }

        charts.forEach((chart, index) => {
          if (index !== 0) {
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
          this.state.controlStates.canEdit,
          true
        );
        this.setCrosshairInterval();
      }
    }
  }

  setDrawingInterval() {
    this.drawingInterval = setInterval(() => {
      let id = this.state.controlStates.drawingId;
      let position = this.state.controlStates.drawingPosition;

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
        this.state.controlStates.canEdit,
        this.state.controlStates.fromLastPosition
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
      this.state.controlStates.fromLastPosition
        ? this.state.controlStates.newPosition
        : undefined,
      undefined,
      this.state.controlStates.canEdit,
      this.state.controlStates.fromLastPosition
    );
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
        this.state.controlStates.canEdit,
        true
      );

      let difference = position + 500 - this.state.dataset.start;
      this.onScrubbed(difference / 1000);
    }, 10);
  }

  clearCrosshairInterval() {
    clearInterval(this.crosshairInterval);
    this.crosshairInterval = false;

    this.updateControlStates(
      undefined,
      undefined,
      undefined,
      this.state.controlStates.canEdit,
      this.state.controlStates.fromLastPosition
    );

    let charts = Highcharts.charts;
    charts.forEach((chart, index) => {
      if (index !== 0) {
        chart.xAxis[0].removePlotLine('plotline_cursor');
      }
    });
  }

  onSelectedLabelingIdChanged(selectedLabelingId) {
    let labeling = this.state.labelings.filter(
      labeling => labeling['_id'] === selectedLabelingId
    )[0];
    let labelTypes = this.state.labels.filter(label =>
      labeling.labels.includes(label['_id'])
    );

    this.setState({
      controlStates: {
        ...this.state.controlStates,
        selectedLabelId: undefined,
        selectedLabelingId: selectedLabelingId,
        selectedLabelTypeId: undefined,
        selectedLabelTypes: labelTypes
      }
    });
  }

  onSelectedLabelTypeIdChanged(selectedLabelTypeId) {
    if (this.state.controlStates.selectedLabelId === undefined) return;

    let dataset = JSON.parse(JSON.stringify(this.state.dataset));
    let labeling = dataset.labelings.filter(
      labeling =>
        labeling.labelingId === this.state.controlStates.selectedLabelingId
    )[0];
    let label = labeling.labels.filter(
      label => label['_id'] === this.state.controlStates.selectedLabelId
    )[0];
    label.type = selectedLabelTypeId;
    label.name = this.state.labels.find(elm => elm._id === selectedLabelTypeId)[
      'name'
    ];
    updateDataset(dataset).then(newDataset => {
      this.setState({
        dataset: newDataset,
        controlStates: {
          ...this.state.controlStates,
          selectedLabelTypeId: selectedLabelTypeId
        }
      });
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
        ...this.state.controlStates,
        selectedLabelId: selectedLabelId,
        selectedLabelTypeId: label ? label.type : undefined
      }
    });
  }

  onLabelChanged(labelId, start, end, callback) {
    let dataset = JSON.parse(JSON.stringify(this.state.dataset));
    let labeling = dataset.labelings.filter(
      labeling =>
        labeling.labelingId === this.state.controlStates.selectedLabelingId
    )[0];

    let labelingOrLabelAdded = false;

    if (!labeling) {
      const labelingId = this.state.controlStates.selectedLabelingId;
      const labelingName = this.state.labelings.filter(
        obj => obj._id === labelingId
      )[0].name;

      labeling = {
        labels: [],
        labelingId: labelingId,
        labelingName: labelingName,
        creator: this.state.dataset.userId
      };

      dataset.labelings = [...dataset.labelings, labeling];
      labelingOrLabelAdded = true;
    }

    let label = {};

    if (labelId === null) {
      // Clicking for the first time
      label = {
        start: start,
        end: end,
        name: this.state.controlStates.selectedLabelTypes[0]['name'],
        type: this.state.controlStates.selectedLabelTypeId
          ? this.state.controlStates.selectedLabelTypeId
          : this.state.controlStates.selectedLabelTypes[0]['_id']
      };

      labeling.labels = [...labeling.labels, label];
      labelingOrLabelAdded = true;
    } else {
      // Clicking for the second time
      label = labeling.labels.filter(label => label['_id'] === labelId)[0];
      if (label !== undefined && label.start === undefined) {
        label.start = start === undefined ? start : end;
      } else if (label !== undefined && label.end === undefined) {
        label.end = start === undefined ? start : end;
      } else {
        label.start = start;
        label.end = end;
      }
    }

    let temp;
    if (label.start > label.end) {
      temp = label.start;
      label.start = label.end;
      label.end = temp;
    }
    label._id = 'fakeID';
    if (labelingOrLabelAdded) {
      let labeling = dataset.labelings.filter(
        labeling =>
          labeling.labelingId === this.state.controlStates.selectedLabelingId
      )[0];
      this.setState({
        dataset: dataset,
        controlStates: {
          ...this.state.controlStates,
          drawingId: labeling.labels[labeling.labels.length - 1]['_id'],
          drawingPosition: labelId === null ? 'fakePosition' : undefined
        }
      });
    } else {
      const dataSetCopy = JSON.parse(JSON.stringify(dataset));
      dataset.labelings.forEach(elm => {
        elm.labels.forEach(label => {
          if (label._id === 'fakeID') {
            delete label._id;
          }
        });
      });
      this.setState({ dataset: dataSetCopy });
      updateDataset(dataset).then(newDataset => {
        this.setState({ dataset: newDataset });
      });
    }
  }

  onDeleteSelectedLabel() {
    if (window.confirm('Are you sure to delete this label?')) {
      let dataset = JSON.parse(JSON.stringify(this.state.dataset));
      let labeling = dataset.labelings.filter(
        labeling =>
          labeling.labelingId === this.state.controlStates.selectedLabelingId
      )[0];

      labeling.labels = labeling.labels.filter(
        label => label['_id'] !== this.state.controlStates.selectedLabelId
      );

      updateDataset(dataset);
      this.setState({
        dataset,
        controlStates: {
          ...this.state.controlStates,
          selectedLabelId: undefined,
          selectedLabelTypeId: undefined
        }
      });
    }
  }

  onCanEditChanged(canEdit) {
    if (!this.drawingInterval) {
      this.setState({
        controlStates: { ...this.state.controlStates, canEdit: canEdit }
      });
    }
  }

  onScrubbed(position) {}

  onDeleteDataset() {
    if (!this.state.dataset || !this.state.dataset['_id']) return;
    deleteDataset(this.state.dataset['_id'])
      .then(() => {
        this.props.navigateTo('datasets');
      })
      .catch(err => {
        window.alert(err);
      });
  }

  render() {
    if (!this.state.isReady) return <Loader loading={true} />;

    let selectedLabeling = this.state.labelings.filter(
      labeling =>
        labeling['_id'] === this.state.controlStates.selectedLabelingId
    )[0];

    let selectedDatasetlabeling = this.state.dataset.labelings.filter(
      labeling => selectedLabeling['_id'] === labeling.labelingId
    )[0];
    if (!selectedDatasetlabeling) selectedDatasetlabeling = {};
    let selectedDatasetLabel =
      selectedDatasetlabeling && selectedDatasetlabeling.labels
        ? selectedDatasetlabeling.labels.filter(
            label => label['_id'] === this.state.controlStates.selectedLabelId
          )[0]
        : null;

    let isDrawingIntervalActive = this.drawingInterval ? true : false;
    let isCrosshairIntervalActive = this.crosshairInterval ? true : false;

    const startOffset = Math.min(
      ...this.state.dataset.timeSeries.map(elm => elm.offset),
      0
    );
    const endOffset = Math.max(
      ...this.state.dataset.timeSeries.map(elm => elm.offset),
      0
    );
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
                  objectType={'labelings'}
                  history={this.props.history}
                  labelings={this.state.labelings}
                  onAddLabeling={this.onAddLabeling}
                  selectedLabelingId={
                    this.state.controlStates.selectedLabelingId
                  }
                  onSelectedLabelingIdChanged={this.onSelectedLabelingIdChanged}
                />
                <TimeSeriesCollectionPanel
                  onSetName={this.onSetName}
                  onSetUnit={this.onSetUnit}
                  onSetAllUnit={this.onSetAllUnit}
                  onSetAllName={this.onSetAllName}
                  timeSeries={this.state.dataset.timeSeries}
                  fusedSeries={this.state.dataset.fusedSeries}
                  labeling={selectedDatasetlabeling}
                  labelTypes={this.state.controlStates.selectedLabelTypes}
                  onLabelClicked={this.onSelectedLabelChanged}
                  selectedLabelId={this.state.controlStates.selectedLabelId}
                  start={this.state.dataset.start + startOffset}
                  end={this.state.dataset.end + endOffset}
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
              {this.state.videoEnabled ? (
                <div>
                  <VideoPanel ref={this.videoPanel} />
                </div>
              ) : null}
              <div className="mt-2">
                <MetadataPanel
                  id={this.state.dataset['_id']}
                  start={this.state.dataset.start}
                  end={this.state.dataset.end}
                  user={this.state.dataset.userId}
                  name={this.state.dataset.name}
                />
              </div>
              <div className="mt-2" />
              <div className="mt-2" style={{ marginBottom: '230px' }}>
                <ManagementPanel
                  labelings={this.state.labelings}
                  onUpload={obj => this.addTimeSeries(obj)}
                  startTime={this.state.dataset.start}
                  onDeleteDataset={this.onDeleteDataset}
                  dataset={this.state.dataset}
                  onDatasetComplete={this.onDatasetUpdated}
                  setModalOpen={this.setModalOpen}
                />
              </div>
            </Col>
            <Col xs={12}>
              <LabelingPanel
                history={this.props.history}
                id={this.state.controlStates.selectedLabelId}
                from={selectedDatasetLabel ? selectedDatasetLabel.start : null}
                to={selectedDatasetLabel ? selectedDatasetLabel.end : null}
                labeling={selectedLabeling}
                labels={this.state.controlStates.selectedLabelTypes}
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
                playButtonEnabled={this.state.playButtonEnabled}
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

export default DatasetPage;
