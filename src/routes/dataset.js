import React, { Component } from 'react';
import { Col, Row, Fade, Button } from 'reactstrap';

import LabelingPanel from '../components/LabelingPanel/LabelingPanel';
import MetadataPanel from '../components/MetadataPanel/MetadataPanel';
import CustomMetadataPanel from '../components/MetadataPanel/CustomMetadataPanel';
import LabelingSelectionPanel from '../components/LabelingSelectionPanel/LabelingSelectionPanel';
import TimeSeriesCollectionPanel from '../components/TimeSeriesCollectionPanel/TimeSeriesCollectionPanel';
import Snackbar from '../components/Snackbar/Snackbar';

import { subscribeLabelingsAndLabels } from '../services/ApiServices/LabelingServices';
import {
  updateDataset,
  deleteDataset,
  getDataset,
  getDatasetTimeseries,
  getDatasetLock,
  changeCanEditDataset,
  getDatasetMeta,
} from '../services/ApiServices/DatasetServices';

import {
  changeDatasetLabel,
  createDatasetLabel,
  deleteDatasetLabel,
} from '../services/ApiServices/DatasetLabelService';

import Loader from '../modules/loader';

import crypto from 'crypto';
import pmemoize from 'promise-memoize';

const TIMESERIES_CACHE_MAX_AGE = 5000; // ms

class DatasetPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataset: undefined,
      previewTimeSeriesData: undefined,
      labelings: [],
      labels: [],
      isReady: false,
      controlStates: {
        selectedLabelId: undefined,
        selectedLabelingId: undefined,
        selectedLabelTypeId: undefined,
        selectedLabelTypes: undefined,
        canEdit: true, // Hardcoded for now
        drawingId: undefined,
        drawingPosition: undefined,
        newPosition: undefined,
        fromLastPosition: false,
      },
      hideLabels: false,
      modalOpen: false,
    };

    this.memoizedGetDatasetTimeseries = pmemoize(getDatasetTimeseries, {
      resolve: 'json',
      maxAge: TIMESERIES_CACHE_MAX_AGE,
    });

    this.onSelectedLabelingIdChanged =
      this.onSelectedLabelingIdChanged.bind(this);
    this.onSelectedLabelTypeIdChanged =
      this.onSelectedLabelTypeIdChanged.bind(this);
    this.onSelectedLabelChanged = this.onSelectedLabelChanged.bind(this);
    this.onDeleteSelectedLabel = this.onDeleteSelectedLabel.bind(this);
    this.onCanEditChanged = this.onCanEditChanged.bind(this);
    this.addTimeSeries = this.addTimeSeries.bind(this);
    this.onLabelingsAndLabelsChanged =
      this.onLabelingsAndLabelsChanged.bind(this);
    this.onDatasetChanged = this.onDatasetChanged.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.getDatasetWindow = this.getDatasetWindow.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.clearKeyBuffer = this.clearKeyBuffer.bind(this);
    this.onScrubbed = this.onScrubbed.bind(this);
    this.onDeleteTimeSeries = this.onDeleteTimeSeries.bind(this);
    this.onShiftTimeSeries = this.onShiftTimeSeries.bind(this);
    this.updateControlStates = this.updateControlStates.bind(this);
    this.onDeleteDataset = this.onDeleteDataset.bind(this);
    this.onAddLabeling = this.onAddLabeling.bind(this);
    this.onClickPosition = this.onClickPosition.bind(this);
    this.onLabelPositionUpdate = this.onLabelPositionUpdate.bind(this);
    this.showSnackbar = this.showSnackbar.bind(this);
    this.onUpdateMetaData = this.onUpdateMetaData.bind(this);
    this.hideLabels = this.hideLabels.bind(this);
    this.pressedKeys = {
      num: [],
      ctrl: false,
      shift: false,
    };
  }

  hideLabels() {
    this.setState((prevState) => ({
      hideLabels: !prevState.hideLabels,
    }));
  }

  onUpdateMetaData(updatedDataset) {
    updateDataset(
      { ...updatedDataset, _id: this.state.dataset._id },
      true
    ).then((newDataset) => {
      this.setState({
        dataset: { ...newDataset, timeSeries: this.state.dataset.timeSeries },
      });
    });
  }

  showSnackbar(errorText, duration) {
    this.setState({
      error: errorText,
    });
    setTimeout(() => {
      this.setState({
        error: undefined,
      });
    }, duration);
  }

  onAddLabeling() {
    const newHistory = this.props.history.location.pathname.split('/');
    newHistory.length -= 2;

    this.props.history.push({
      pathname: newHistory.join('/') + '/labelings/new',
    });
  }

  setModalOpen(isOpen) {
    this.setState({
      modalOpen: isOpen,
    });
  }

  async loadData() {
    const dataset = await getDatasetMeta(this.props.match.params.id);
    const dataset_end = Math.max(...dataset.timeSeries.map((elm) => elm.end));
    const dataset_start = Math.min(
      ...dataset.timeSeries.map((elm) => elm.start)
    );
    dataset.end = dataset_end;
    dataset.start = dataset_start;
    return dataset;
  }

  componentDidMount() {
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('keydown', this.onKeyDown);
    this.loadData().then((data) => this.onDatasetChanged(data));
    getDatasetLock(this.props.match.params.id).then((canEdit) =>
      this.setState({
        controlStates: { ...this.state.controlStates, canEdit },
      })
    );

    // get a downsampled preview for the timeseries, used for the initial graph + scrollbar
    // half the window width seems like a good compromise for resolution
    this.memoizedGetDatasetTimeseries(this.props.match.params.id, {
      max_resolution: window.innerWidth / 2,
    }).then((timeseriesData) => {
      this.setState({
        previewTimeSeriesData: timeseriesData,
      });
    });
  }

  async getDatasetWindow(start, end, max_resolution) {
    return await this.memoizedGetDatasetTimeseries(this.props.match.params.id, {
      max_resolution,
      start,
      end,
    });
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onDatasetChanged(dataset) {
    if (!dataset) return;
    this.setState({ dataset }, () =>
      subscribeLabelingsAndLabels().then((result) => {
        this.onLabelingsAndLabelsChanged(result.labelings, result.labels);
      })
    );
  }

  onLabelingsAndLabelsChanged(labelings, labels) {
    let selectedLabeling = labelings[0];
    let selectedLabelTypes = undefined;
    if (labels) {
      if (selectedLabeling) {
        selectedLabelTypes = labels.filter((label) =>
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
        selectedLabelTypes: selectedLabelTypes,
      },
      isReady: true,
    });
  }

  onKeyDown(e) {
    if (
      this.state.modalOpen ||
      this.props.modalOpen ||
      document.querySelectorAll('.modal').length > 0
    ) {
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
            let labeling = this.state.labelings.filter((labeling) => {
              return labeling['_id'] === controlStates.selectedLabelingId;
            })[0];

            let labels = this.state.labels.filter((label) =>
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
    dataset.timeSeries.push(obj);

    labels = labels.filter((label) => {
      let labelings = this.state.labelings;

      for (let j = 0; j < labelings.length; j++) {
        let labelTypes = this.state.labels.filter((labelType) =>
          labelings[j].labels.includes(labelType['_id'])
        );

        if (label.labelingId === labelings[j]['_id']) {
          if (!labelTypes.some((type) => type['_id'] === label.typeId)) {
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
                end: label.end,
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

    dataset.end = Math.max(obj.data[obj.data.length - 1][0], dataset.end);
    dataset.start = Math.min(obj.data[0][0], dataset.start);

    updateDataset(dataset).then((dataset) => {
      this.setState({ dataset });
    });
  }

  onDeleteTimeSeries(fused, index) {
    let dataset = JSON.parse(JSON.stringify(this.state.dataset));

    updateDataset(dataset).then((newDataset) => {
      this.setState({
        dataset: newDataset,
      });
    });
  }

  onShiftTimeSeries(index, timestamp) {
    let dataset = JSON.parse(JSON.stringify(this.state.dataset));

    let diff = timestamp - (dataset.start + dataset.timeSeries[index].offset);
    dataset.timeSeries[index].offset += diff;

    updateDataset(dataset).then((newDataset) => {
      this.setState({
        dataset: newDataset,
      });
    });
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
        fromLastPosition: fromLastPosition,
      },
    });
  }

  onSelectedLabelingIdChanged(selectedLabelingId) {
    let labeling = this.state.labelings.filter(
      (labeling) => labeling['_id'] === selectedLabelingId
    )[0];
    let labelTypes = this.state.labels.filter((label) =>
      labeling.labels.includes(label['_id'])
    );
    this.setState({
      controlStates: {
        ...this.state.controlStates,
        selectedLabelId: undefined,
        selectedLabelingId: selectedLabelingId,
        selectedLabelTypeId: undefined,
        selectedLabelTypes: labelTypes,
      },
    });
  }

  onSelectedLabelTypeIdChanged(selectedLabelTypeId) {
    if (this.state.controlStates.selectedLabelId === undefined) return;

    let dataset = JSON.parse(JSON.stringify(this.state.dataset));
    let labeling = dataset.labelings.filter(
      (labeling) =>
        labeling.labelingId === this.state.controlStates.selectedLabelingId
    )[0];
    let label = labeling.labels.filter(
      (label) => label['_id'] === this.state.controlStates.selectedLabelId
    )[0];
    const oldLabelType = label.type;
    label.type = selectedLabelTypeId;
    label.name = this.state.labels.find(
      (elm) => elm._id === selectedLabelTypeId
    )['name'];

    const oldSelectedLabelTypeId = this.state.controlStates.selectedLabelTypeId;
    this.setState({
      dataset: dataset,
      controlStates: {
        ...this.state.controlStates,
        selectedLabelTypeId: selectedLabelTypeId,
      },
    });
    changeDatasetLabel(dataset._id, labeling.labelingId, label).catch(() => {
      this.showSnackbar('Could not change label type', 5000);
      label.type = oldLabelType;
      this.setState({
        dataset: dataset,
        controlStates: {
          ...this.state.controlStates,
          selectedLabelTypeId: oldSelectedLabelTypeId,
        },
      });
    });
  }

  onSelectedLabelChanged(selectedLabelId) {
    let labeling = this.state.dataset.labelings.filter(
      (labeling) =>
        labeling.labelingId === this.state.controlStates.selectedLabelingId
    )[0];
    if (!labeling) return;
    let label = labeling.labels.filter(
      (label) => label['_id'] === selectedLabelId
    )[0];

    this.setState({
      controlStates: {
        ...this.state.controlStates,
        selectedLabelId: selectedLabelId,
        selectedLabelTypeId: label ? label.type : undefined,
      },
    });
  }

  onClickPosition(position) {
    const labelingIdx = this.state.dataset.labelings.findIndex(
      (elm) => elm.labelingId === this.state.controlStates.selectedLabelingId
    );

    if (
      !this.state.controlStates.selectedLabelTypeId &&
      !this.state.controlStates.selectedLabelTypes.length
    ) {
      this.showSnackbar('No labels available', 5000);
      return;
    }

    if (!this.state.controlStates.drawingId) {
      // First time to click
      const randomId = crypto.randomBytes(20).toString('hex');
      const newLabel = {
        start: position,
        end: undefined,
        _id: randomId,
        type:
          this.state.controlStates.selectedLabelTypeId ||
          this.state.controlStates.selectedLabelTypes[0]['_id'],
      };
      const newDataset = this.state.dataset;
      if (labelingIdx < 0) {
        newDataset.labelings.push({
          labelingId: this.state.controlStates.selectedLabelingId,
          labels: [newLabel],
        });
      } else {
        newDataset.labelings[labelingIdx].labels.push(newLabel);
      }
      this.setState({
        dataset: newDataset,
        controlStates: {
          ...this.state.controlStates,
          drawingPosition: position,
          drawingId: randomId,
        },
      });
    } else {
      // Click for the second time to finish label creation
      const newDataset = this.state.dataset;
      const labelIdx = newDataset.labelings[labelingIdx].labels.findIndex(
        (elm) => elm._id === this.state.controlStates.drawingId
      );
      const newLabel = newDataset.labelings[labelingIdx].labels[labelIdx];
      newLabel.start = Math.min(newLabel.start, position);
      newLabel.end = Math.max(newLabel.start, position);
      if (
        labelIdx - 1 >= 0 &&
        newDataset.labelings[labelingIdx].labels[labelIdx - 1]
      ) {
        const prevLabel =
          newDataset.labelings[labelingIdx].labels[labelIdx - 1];
        newLabel.type = prevLabel.type;
      }
      this.setState({
        dataset: newDataset,
        controlStates: {
          ...this.state.controlStates,
          drawingPosition: undefined,
          drawingId: undefined,
          selectedLabelId: newLabel._id,
          selectedLabelTypeId: newLabel.type,
        },
      });
      createDatasetLabel(
        newDataset._id,
        this.state.controlStates.selectedLabelingId,
        {
          ...newDataset.labelings[labelingIdx].labels[labelIdx],
          _id: undefined,
        }
      )
        .then((generatedLabel) => {
          const labelIdx = newDataset.labelings[labelingIdx].labels.findIndex(
            (elm) => elm._id === newLabel._id
          );
          newDataset.labelings[labelingIdx].labels[labelIdx] = generatedLabel;
          this.setState({
            dataset: newDataset,
            controlStates: {
              ...this.state.controlStates,
              selectedLabelId: generatedLabel._id,
              selectedLabelTypeId: generatedLabel.type,
            },
          });
        })
        .catch(() => {
          this.showSnackbar('Could not create label', 5000);
          // Delete label again
          newDataset.labelings[labelingIdx].labels.splice(labelIdx, 1);
          this.setState({
            dataset: newDataset,
            controlStates: {
              ...this.state.controlStates,
              selectedLabelId: undefined,
            },
          });
        });
    }
  }

  onLabelPositionUpdate(labelId, start, end) {
    const newDataset = this.state.dataset;
    const labelingIdx = newDataset.labelings.findIndex(
      (labeling) =>
        labeling.labelingId === this.state.controlStates.selectedLabelingId
    );
    var labelIdx = newDataset.labelings[labelingIdx].labels.findIndex(
      (label) => label._id === labelId
    );
    const newLabel = newDataset.labelings[labelingIdx].labels[labelIdx];
    const backUpLabel = JSON.parse(JSON.stringify(newLabel));
    newLabel.start = Math.min(start, end);
    newLabel.end = Math.max(start, end);

    changeDatasetLabel(
      newDataset._id,
      newDataset.labelings[labelingIdx].labelingId,
      newLabel
    ).catch(() => {
      this.showSnackbar('Could not change label', 5000);
      // Revert changes
      newDataset.labelings[labelingIdx].labels[labelIdx] = backUpLabel;
      this.setState({
        dataset: newDataset,
      });
    });
  }

  onDeleteSelectedLabel() {
    if (window.confirm('Are you sure to delete this label?')) {
      let dataset = this.state.dataset;
      let labeling = dataset.labelings.filter(
        (labeling) =>
          labeling.labelingId === this.state.controlStates.selectedLabelingId
      )[0];

      /*labeling.labels = labeling.labels.filter(
        (label) => label["_id"] !== this.state.controlStates.selectedLabelId
      );*/
      const labelIdxToDelete = labeling.labels.findIndex(
        (label) => label['_id'] === this.state.controlStates.selectedLabelId
      );

      const labelToDelete = labeling.labels[labelIdxToDelete];

      labeling.labels.splice(labelIdxToDelete, 1);

      // Delete labeling when no labels are present for this labeling
      if (labeling.labels.length === 0) {
        dataset.labelings = dataset.labelings.filter(
          (elm) => elm._id !== labeling._id
        );
      }

      const labelingIdToDelete = this.state.controlStates.selectedLabelingId;
      const labelIdToDelete = this.state.controlStates.selectedLabelId;

      this.setState({
        dataset,
        controlStates: {
          ...this.state.controlStates,
          selectedLabelId: undefined,
          selectedLabelTypeId: undefined,
        },
      });
      deleteDatasetLabel(dataset._id, labelingIdToDelete, labelIdToDelete)
        .then(() => {})
        .catch(() => {
          this.showSnackbar('Cannot delete label', 5000);
          // Restore label
          labeling.labels.push(labelToDelete);
          this.setState({
            dataset: dataset,
          });
        });
    }
  }

  onCanEditChanged(canEdit) {
    changeCanEditDataset(this.state.dataset, canEdit).then((newCanEdit) => {
      this.setState({
        controlStates: { ...this.state.controlStates, canEdit: newCanEdit },
      });
    });
  }

  onScrubbed(position) {}

  onDeleteDataset() {
    if (!this.state.dataset || !this.state.dataset['_id']) return;
    deleteDataset(this.state.dataset['_id'])
      .then(() => {
        this.props.navigateTo('datasets');
      })
      .catch((err) => {
        window.alert(err);
      });
  }

  render() {
    if (
      !this.state.isReady ||
      this.state.controlStates.canEdit === undefined ||
      !this.state.previewTimeSeriesData
    )
      return <Loader loading={true} />;

    let selectedLabeling = this.state.labelings.filter(
      (labeling) =>
        labeling['_id'] === this.state.controlStates.selectedLabelingId
    )[0];

    let selectedDatasetlabeling = this.state.dataset.labelings.filter(
      (labeling) => selectedLabeling['_id'] === labeling.labelingId
    )[0];

    if (!selectedDatasetlabeling) selectedDatasetlabeling = {};
    let selectedDatasetLabel =
      selectedDatasetlabeling && selectedDatasetlabeling.labels
        ? selectedDatasetlabeling.labels.find(
            (label) => label['_id'] === this.state.controlStates.selectedLabelId
          )
        : null;

    let isCrosshairIntervalActive = this.crosshairInterval ? true : false;

    // const startOffset = Math.min(
    //   ...this.state.dataset.timeSeries.map((elm) => elm.offset),
    //   0
    // );
    // const endOffset = Math.max(
    //   ...this.state.dataset.timeSeries.map((elm) => elm.offset),
    //   0
    // );

    const startOffset = 0;
    const endOffset = 0;
    console.log('dsett;', this.state);
    return (
      <div className="w-100 position-relative">
        {' '}
        <Fade in={this.state.fadeIn}>
          <div>
            <Row className="pt-3 m-0">
              <Col
                ref={this.middle_col_width}
                onMouseUp={this.mouseUpHandler}
                xs={12}
                lg={9}
                className="pr-lg-0"
              >
                <div className="position-relative">
                  <LabelingSelectionPanel
                    objectType={'labelings'}
                    history={this.props.history}
                    labelings={this.state.labelings}
                    onAddLabeling={this.onAddLabeling}
                    selectedLabelingId={
                      this.state.controlStates.selectedLabelingId
                    }
                    onSelectedLabelingIdChanged={
                      this.onSelectedLabelingIdChanged
                    }
                    onCanEditChanged={this.onCanEditChanged}
                    canEdit={this.state.controlStates.canEdit}
                    isCrosshairIntervalActive={isCrosshairIntervalActive}
                    hideLabels={this.state.hideLabels}
                    onHideLabels={this.hideLabels}
                  />
                  <TimeSeriesCollectionPanel
                    timeSeries={this.state.dataset.timeSeries}
                    previewTimeSeriesData={this.state.previewTimeSeriesData}
                    getDatasetWindow={this.getDatasetWindow}
                    labeling={
                      this.state.hideLabels
                        ? { labels: undefined }
                        : selectedDatasetlabeling
                    }
                    labelTypes={this.state.controlStates.selectedLabelTypes}
                    onLabelClicked={this.onSelectedLabelChanged}
                    selectedLabelId={this.state.controlStates.selectedLabelId}
                    start={this.state.dataset.start + startOffset}
                    end={this.state.dataset.end + endOffset}
                    canEdit={this.state.controlStates.canEdit}
                    onScrubbed={this.onScrubbed}
                    onShift={this.onShiftTimeSeries}
                    onDelete={this.onDeleteTimeSeries}
                    drawingId={this.state.controlStates.drawingId}
                    drawingPosition={this.state.controlStates.drawingPosition}
                    newPosition={this.state.controlStates.newPosition}
                    updateControlStates={this.updateControlStates}
                    onClickPosition={this.onClickPosition}
                    onLabelPositionUpdate={this.onLabelPositionUpdate}
                  />
                  <LabelingPanel
                    className="StickyLabelingSelectionPanel"
                    history={this.props.history}
                    id={this.state.controlStates.selectedLabelId}
                    from={
                      selectedDatasetLabel ? selectedDatasetLabel.start : null
                    }
                    to={selectedDatasetLabel ? selectedDatasetLabel.end : null}
                    labeling={selectedLabeling}
                    labels={this.state.controlStates.selectedLabelTypes}
                    selectedLabelTypeId={
                      this.state.controlStates.selectedLabelTypeId
                    }
                    onSelectedLabelTypeIdChanged={
                      this.onSelectedLabelTypeIdChanged
                    }
                    onDeleteSelectedLabel={this.onDeleteSelectedLabel}
                    canEdit={this.state.controlStates.canEdit}
                  />
                </div>
                <div className="dataset-labelingpanel">
                  {this.state.error ? (
                    <Fade>
                      <div className="dataset-snackbar-center">
                        <Snackbar
                          text={this.state.error}
                          closeSnackbar={() => {
                            this.setState({ error: undefined });
                          }}
                        ></Snackbar>
                      </div>
                    </Fade>
                  ) : null}
                </div>
              </Col>
              <Col xs={12} lg={3}>
                <div className="mt-2">
                  <MetadataPanel
                    start={this.state.dataset.start}
                    end={this.state.dataset.end}
                    user={this.state.dataset.userId}
                    name={this.state.dataset.name}
                  />
                </div>
                <div className="mt-2">
                  <CustomMetadataPanel
                    metaData={this.state.dataset.metaData}
                    onUpdateMetaData={this.onUpdateMetaData}
                  ></CustomMetadataPanel>
                </div>
                <div className="mt-2" />
              </Col>
            </Row>
          </div>
        </Fade>
      </div>
    );
  }
}

export default DatasetPage;
