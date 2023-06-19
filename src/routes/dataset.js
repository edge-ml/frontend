import React, { Component } from 'react';
import { Col, Row, Fade, Button, Container } from 'reactstrap';

import LabelingPanel from '../components/LabelingPanel/LabelingPanel';
import MetadataPanel from '../components/MetadataPanel/MetadataPanel';
import CustomMetadataPanel from '../components/MetadataPanel/CustomMetadataPanel';
import LabelingSelectionPanel from '../components/LabelingSelectionPanel/LabelingSelectionPanel';
import TimeSeriesCollectionPanel from '../components/TimeSeriesCollectionPanel/TimeSeriesCollectionPanel';
import Snackbar from '../components/Snackbar/Snackbar';
import TSSelectionPanel from '../components/TSSelectionPanel';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

import { MetaDataSidebar } from '../components/MetaDataSidebar/MetaDataSidebar';

import { subscribeLabelingsAndLabels } from '../services/ApiServices/LabelingServices';
import {
  updateDataset,
  deleteDataset,
  getDataset,
  getDatasetTimeseries,
  getDatasetLock,
  getDatasetMeta,
  getTimeSeriesDataPartial,
} from '../services/ApiServices/DatasetServices';

import {
  changeDatasetLabel,
  createDatasetLabel,
  deleteDatasetLabel,
} from '../services/ApiServices/DatasetLabelService';

import Loader from '../modules/loader';

import pmemoize from 'promise-memoize';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faTimes } from '@fortawesome/free-solid-svg-icons';

const TIMESERIES_CACHE_MAX_AGE = 5000; // ms

class DatasetPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataset: undefined,
      previewTimeSeriesData: undefined,
      labelings: [],
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
      activeSeries: [],
      metaDataExtended: false,
    };

    this.memoizedGetDatasetTimeseries = pmemoize(getTimeSeriesDataPartial, {
      resolve: 'json',
      maxAge: TIMESERIES_CACHE_MAX_AGE,
    });

    this.onSelectedLabelingIdChanged =
      this.onSelectedLabelingIdChanged.bind(this);
    this.onSelectedLabelTypeIdChanged =
      this.onSelectedLabelTypeIdChanged.bind(this);
    this.onSelectedLabelChanged = this.onSelectedLabelChanged.bind(this);
    this.onDeleteSelectedLabel = this.onDeleteSelectedLabel.bind(this);
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
    this.updateControlStates = this.updateControlStates.bind(this);
    this.onDeleteDataset = this.onDeleteDataset.bind(this);
    this.onAddLabeling = this.onAddLabeling.bind(this);
    this.onClickPosition = this.onClickPosition.bind(this);
    this.onLabelPositionUpdate = this.onLabelPositionUpdate.bind(this);
    this.showSnackbar = this.showSnackbar.bind(this);
    this.onUpdateMetaData = this.onUpdateMetaData.bind(this);
    this.hideLabels = this.hideLabels.bind(this);
    this.onClickSelectSeries = this.onClickSelectSeries.bind(this);
    this.toggleMetaData = this.toggleMetaData.bind(this);
    this.pressedKeys = {
      num: [],
      ctrl: false,
      shift: false,
    };
    this.maxSeries = 3;
  }

  onClickSelectSeries(_id) {
    var series = this.state.activeSeries;
    if (series.includes(_id)) {
      series = series.filter((elm) => elm !== _id);
    } else {
      series.push(_id);
    }

    const ts = this.state.dataset.timeSeries.filter((ts) =>
      series.includes(ts._id)
    );
    const newStart = Math.min(...ts.map((elm) => elm.start));
    const newEnd = Math.max(...ts.map((elm) => elm.end));

    this.memoizedGetDatasetTimeseries(this.props.match.params.id, series, {
      max_resolution: window.innerWidth / 2,
    }).then((tsData) => {
      this.setState({
        previewTimeSeriesData: tsData,
        activeSeries: series,
        shownStart: newStart,
        shownEnd: newEnd,
      });
    });

    Highcharts.charts.forEach((chart) => {
      if (chart) {
        chart.xAxis[0].setExtremes(newStart, newEnd, true, false);
      }
    });
  }

  toggleMetaData(state) {
    this.setState({
      metaDataExtended: state,
    });
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
    if (dataset.timeSeries.length < 6) {
      this.setState({
        activeSeries: dataset.timeSeries.map((elm) => elm._id),
      });
    }
    return dataset;
  }

  async componentDidMount() {
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('keydown', this.onKeyDown);
    // this.loadData().then((data) => this.onDatasetChanged(data));

    var activeSeries = [];
    const dataset = await getDatasetMeta(this.props.match.params.id);
    const dataset_end = Math.max(...dataset.timeSeries.map((elm) => elm.end));
    const dataset_start = Math.min(
      ...dataset.timeSeries.map((elm) => elm.start)
    );
    dataset.end = dataset_end;
    dataset.start = dataset_start;
    if (dataset.timeSeries.length < 6) {
      activeSeries = dataset.timeSeries.map((elm) => elm._id);
      this.setState({
        activeSeries: activeSeries,
      });
    }
    this.onDatasetChanged(dataset);

    this.memoizedGetDatasetTimeseries(
      this.props.match.params.id,
      activeSeries,
      {
        max_resolution: window.innerWidth / 2,
      }
    ).then((timeseriesData) => {
      if (this.state.previewTimeSeriesData) {
        return;
      }
      this.setState({
        previewTimeSeriesData: timeseriesData,
      });
    });
  }

  async getDatasetWindow(start, end, max_resolution) {
    const res = await this.memoizedGetDatasetTimeseries(
      this.props.match.params.id,
      this.state.activeSeries,
      {
        max_resolution,
        start,
        end,
      }
    );
    return res;
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('keydown', this.onKeyDown);
  }

  onDatasetChanged(dataset) {
    if (!dataset) return;
    this.setState({ dataset }, () =>
      subscribeLabelingsAndLabels().then((labelings) => {
        this.onLabelingsAndLabelsChanged(labelings);
      })
    );
  }

  onLabelingsAndLabelsChanged(labelings) {
    let selectedLabeling = labelings[0];
    let selectedLabelTypes = undefined;
    if (
      selectedLabeling &&
      selectedLabeling.labels &&
      selectedLabeling.labels.length
    ) {
      selectedLabelTypes = labelings[0].labels;
    }
    this.setState({
      labelings: labelings || [],
      controlStates: {
        ...this.state.controlStates,
        selectedLabelingId: selectedLabeling
          ? selectedLabeling['_id']
          : undefined,
        selectedLabelTypes: selectedLabelTypes,
        selectedLabelTypeId: labelings[0]
          ? labelings[0].labels[0]._id
          : undefined,
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

    // Delete label on backspace / delete
    if (e.keyCode === 8 || e.keyCode === 46) {
      this.onDeleteSelectedLabel();
    }

    // Change label-type
    if (e.shiftKey) {
      if (e.keyCode >= 48 && e.keyCode <= 57) {
        const number = parseInt(String.fromCharCode(e.keyCode));

        // If no label is selected, just chnage the used labeltype
        if (!this.state.controlStates.selectedLabelId) {
          const newType = this.state.labelings.find(
            (elm) => elm._id === this.state.controlStates.selectedLabelingId
          ).labels[number - 1]._id;
          this.setState({
            controlStates: {
              ...this.state.controlStates,
              selectedLabelTypeId: newType,
            },
          });
          e.stopPropagation();
          return;
        }

        const labelingIdx = this.state.dataset.labelings.findIndex(
          (elm) =>
            elm.labelingId === this.state.controlStates.selectedLabelingId
        );
        if (
          this.state.labelings.find(
            (elm) => elm._id === this.state.controlStates.selectedLabelingId
          ).labels.length < number
        ) {
          e.stopPropagation();
          return;
        }
        const labelIdx = this.state.dataset.labelings[
          labelingIdx
        ].labels.findIndex(
          (elm) => elm._id === this.state.controlStates.selectedLabelId
        );
        const newDataset = this.state.dataset;
        const newType = this.state.labelings.find(
          (elm) => elm._id === this.state.controlStates.selectedLabelingId
        ).labels[number - 1]._id;
        newDataset.labelings[labelingIdx].labels[labelIdx].type = newType;
        const newControllState = this.state.controlStates;
        newControllState.selectedLabelTypeId = newType;
        this.setState({
          dataset: newDataset,
        });
        changeDatasetLabel(
          newDataset._id,
          this.state.controlStates.selectedLabelingId,
          newDataset.labelings[labelingIdx].labels[labelIdx]
        );
      }
    }
    e.stopPropagation();
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
    console.log(selectedLabelingId);
    let labeling = this.state.labelings.filter(
      (labeling) => labeling['_id'] === selectedLabelingId
    )[0];

    const labelTypes = labeling.labels;
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
    this.setState({
      controlStates: {
        ...this.state.controlStates,
        selectedLabelTypeId: selectedLabelTypeId,
      },
    });
    if (this.state.controlStates.selectedLabelId) {
      const labelingIdx = this.state.dataset.labelings.findIndex(
        (elm) => elm.labelingId === this.state.controlStates.selectedLabelingId
      );

      const labelIdx = this.state.dataset.labelings[
        labelingIdx
      ].labels.findIndex(
        (elm) => elm._id === this.state.controlStates.selectedLabelId
      );
      const newDataset = this.state.dataset;
      newDataset.labelings[labelingIdx].labels[labelIdx].type =
        selectedLabelTypeId;
      const newControllState = this.state.controlStates;
      newControllState.selectedLabelTypeId = selectedLabelTypeId;
      this.setState({
        dataset: newDataset,
      });
      changeDatasetLabel(
        newDataset._id,
        this.state.controlStates.selectedLabelingId,
        newDataset.labelings[labelingIdx].labels[labelIdx]
      );
    }
  }

  onSelectedLabelChanged(selectedLabelId) {
    console.log('onlableClick');
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
        selectedLabelTypeId: label
          ? label.type
          : this.state.controlStates.selectedLabelTypeId,
      },
    });
  }

  onClickPosition(position) {
    console.log(position);
    // don't add new labels if we don't show them
    if (this.state.hideLabels) {
      return;
    }

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
      const randomId = Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padEnd(6, '0');

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
      newLabel.end = position;
      if (newLabel.end < newLabel.start) {
        const tmp = newLabel.end;
        newLabel.end = newLabel.start;
        newLabel.start = tmp;
      }
      if (
        labelIdx - 1 >= 0 &&
        newDataset.labelings[labelingIdx].labels[labelIdx - 1]
      ) {
        console.log(this.state.controlStates.selectedLabelTypeId);
        newLabel.type = this.state.controlStates.selectedLabelTypeId;
      }
      newDataset.labelings[labelingIdx].labels[labelIdx] = newLabel;
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
        .catch((e) => {
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
    newLabel.start = start;
    newLabel.end = end;
    if (newLabel.end < newLabel.start) {
      const tmp = newLabel.end;
      newLabel.end = newLabel.start;
      newLabel.start = tmp;
    }
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
      this.state.controlStates.canEdit === undefined
      // ||  !this.state.previewTimeSeriesData
    )
      return <Loader loading={true} />;

    let selectedLabeling = this.state.labelings.filter(
      (labeling) =>
        labeling['_id'] === this.state.controlStates.selectedLabelingId
    )[0];

    let selectedDatasetlabeling = this.state.dataset.labelings.filter(
      (labeling) => selectedLabeling['_id'] === labeling.labelingId
    )[0];
    console.log(selectedDatasetlabeling);

    if (!selectedDatasetlabeling) selectedDatasetlabeling = {};
    let selectedDatasetLabel =
      selectedDatasetlabeling && selectedDatasetlabeling.labels
        ? selectedDatasetlabeling.labels.find(
            (label) => label['_id'] === this.state.controlStates.selectedLabelId
          )
        : null;

    let isCrosshairIntervalActive = this.crosshairInterval ? true : false;

    return (
      <div
        className="dataset-full-page"
        onKeyDown={this.onKeyDown}
        tabIndex={0}
      >
        <div className="w-100 position-relative">
          <Fade in={this.state.fadeIn}>
            <div>
              <Row className="pt-3 m-0 pr-3">
                <Col
                  ref={this.middle_col_width}
                  onMouseUp={this.mouseUpHandler}
                  xs={12}
                  lg={12}
                  className="pr-lg-0"
                >
                  <div className="position-relative">
                    <LabelingSelectionPanel
                      dataset={this.state.dataset}
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
                      datasetStart={Math.min(
                        ...this.state.dataset.timeSeries.map((elm) => elm.start)
                      )}
                      datasetEnd={Math.max(
                        ...this.state.dataset.timeSeries.map((elm) => elm.end)
                      )}
                      activeSeries={this.state.activeSeries}
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
                      start={this.state.shownStart || this.state.dataset.start}
                      end={this.state.shownEnd || this.state.dataset.end}
                      canEdit={this.state.controlStates.canEdit}
                      onScrubbed={this.onScrubbed}
                      onDelete={this.onDeleteTimeSeries}
                      drawingId={this.state.controlStates.drawingId}
                      drawingPosition={this.state.controlStates.drawingPosition}
                      newPosition={this.state.controlStates.newPosition}
                      updateControlStates={this.updateControlStates}
                      onClickPosition={this.onClickPosition}
                      onLabelPositionUpdate={this.onLabelPositionUpdate}
                    />
                    <Fade
                      className="LabelingPanel"
                      in={!this.state.hideLabels}
                      unmountOnExit={true}
                    >
                      <LabelingPanel
                        className="StickyLabelingSelectionPanel"
                        history={this.props.history}
                        id={this.state.controlStates.selectedLabelId}
                        from={
                          selectedDatasetLabel
                            ? selectedDatasetLabel.start
                            : null
                        }
                        to={
                          selectedDatasetLabel ? selectedDatasetLabel.end : null
                        }
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
                    </Fade>
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
              </Row>
            </div>
          </Fade>
        </div>
        {!this.state.metaDataExtended ? (
          <div
            className="full-page-extend-metaData cursor-pointer"
            onClick={() => this.toggleMetaData(true)}
          >
            <FontAwesomeIcon size="2x" icon={faChevronLeft}></FontAwesomeIcon>
          </div>
        ) : null}
        {this.state.metaDataExtended ? (
          <Container>
            <div className="dataset-side-panel">
              <div
                className="dataset-side-panel-close cursor-pointer"
                onClick={() => this.toggleMetaData(false)}
              >
                <FontAwesomeIcon
                  size="lg"
                  icon={faTimes}
                  inverse
                ></FontAwesomeIcon>
              </div>
              <div className="mt-2">
                <TSSelectionPanel
                  onClickSelectSeries={this.onClickSelectSeries}
                  timeSeries={this.state.dataset.timeSeries}
                  activeSeries={this.state.activeSeries}
                ></TSSelectionPanel>
              </div>
              <div className="mt-2">
                <MetadataPanel
                  start={Math.min(
                    ...this.state.dataset.timeSeries.map((elm) => elm.start)
                  )}
                  end={Math.max(
                    ...this.state.dataset.timeSeries.map((elm) => elm.end)
                  )}
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
            </div>
          </Container>
        ) : null}
      </div>
    );
  }
}

export default DatasetPage;
