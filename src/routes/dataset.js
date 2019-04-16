import React, { Component } from 'react';
import { Col, Row, Fade, Button } from 'reactstrap';
import { view } from 'react-easy-state';

import LabelingPanel from '../components/LabelingPanel/LabelingPanel';
import TagsPanel from '../components/TagsPanel/TagsPanel';
import ManagementPanel from '../components/ManagementPanel/ManagementPanel';
import MetadataPanel from '../components/MetadataPanel/MetadataPanel';
import InteractionControlPanel from '../components/InteractionControlPanel/InteractionControlPanel';
import LabelingSelectionPanel from '../components/LabelingSelectionPanel/LabelingSelectionPanel';
import TimeSeriesCollectionPanel from '../components/TimeSeriesCollectionPanel/TimeSeriesCollectionPanel';
import CombineTimeSeriesModal from '../components/CombineTimeSeriesModal/CombineTimeSeriesModal';
import { uuidv4 } from '../services/UUIDService';

import {
  subscribeLabelings,
  updateLabelings,
  unsubscribeLabelings
} from '../services/SocketService';
import Loader from '../modules/loader';

class DatasetPage extends Component {
  constructor(props) {
    let isSandbox = props.location.pathname === '/datasets/sandbox';

    var now = Date.now();
    const dataset = isSandbox
      ? {
          id: 'sandbox',
          userId: 'sandboxUser',
          email: 'sand@box.com',
          start: now - 100000,
          end: now + 100000,
          tags: ['Sandbox Tag'],
          isPublished: false,
          timeSeries: [],
          labelings: []
        }
      : {
          // TODO: pull real dataset
          id: '0x1234',
          userId: '0x9321',
          email: 'test@test.de',
          start: now - 600000,
          end: now + 100000,
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
                [now - 300000, 20],
                [now - 200000, 40],
                [now - 180000, 60],
                [now - 140000, 10],
                [now - 110000, 15],
                [now - 80000, 30]
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
        };

    super(props);
    this.state = {
      dataset: dataset, //props.dataset
      labelingsDefinition: [],
      isReady: false,
      controlStates: {
        selectedLabelId: undefined,
        selectedLabelingId: undefined,
        selectedLabelTypeId: undefined,
        canEdit: false
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
    this.uuidv4 = this.uuidv4.bind(this);
  }

  onLabelingsChanged(labelings) {
    if (!labelings) labelings = [];

    let dataset = { ...this.state.dataset };
    labelings.forEach(def => {
      if (
        !this.state.dataset.labelings.some(
          labeling => labeling.labelingId === def.id
        )
      ) {
        dataset.labelings.push({
          id: this.uuidv4(),
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
        canEdit: this.state.controlStates.canEdit
      },
      isReady: true
    });
  }

  componentDidMount() {
    subscribeLabelings(this.onLabelingsChanged);
  }

  componentWillUnmount() {
    unsubscribeLabelings();
  }

  addTimeSeries(obj) {
    let dataset = { ...this.state.dataset };
    dataset.timeSeries.push(obj);
    this.setState({ dataset });
  }

  onSelectedLabelingIdChanged(selectedLabelingId) {
    this.setState({
      controlStates: {
        selectedLabelId: undefined,
        selectedLabelingId: selectedLabelingId,
        selectedLabelTypeId: undefined,
        canEdit: this.state.controlStates.canEdit
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
      label => label.id === this.state.controlStates.selectedLabelId
    )[0];
    var selectedLabeling = this.state.labelingsDefinition.filter(
      labeling => labeling.id === this.state.controlStates.selectedLabelingId
    )[0];
    var selectedLabelingTypes = selectedLabeling.types;
    label.typeId = selectedLabelingTypes.filter(
      labelType => labelType.id === selectedLabelTypeId
    )[0].id;

    this.setState({
      controlStates: {
        selectedLabelId: this.state.controlStates.selectedLabelId,
        selectedLabelingId: this.state.controlStates.selectedLabelingId,
        selectedLabelTypeId: selectedLabelTypeId,
        canEdit: this.state.controlStates.canEdit
      }
    });
  }

  onSelectedLabelChanged(selectedLabelId) {
    let labeling = this.state.dataset.labelings.filter(
      labeling =>
        labeling.labelingId === this.state.controlStates.selectedLabelingId
    )[0];
    let label = labeling.labels.filter(
      label => label.id === selectedLabelId
    )[0];
    this.setState({
      controlStates: {
        selectedLabelId: selectedLabelId,
        selectedLabelingId: this.state.controlStates.selectedLabelingId,
        selectedLabelTypeId: label ? label.typeId : undefined,
        canEdit: this.state.controlStates.canEdit
      }
    });
  }

  onLabelChanged(labelId, from, to) {
    let labeling = this.state.dataset.labelings.filter(
      labeling =>
        labeling.labelingId === this.state.controlStates.selectedLabelingId
    )[0];

    let label = labeling.labels.filter(label => label.id === labelId)[0];

    if (label !== undefined && label.from === undefined) {
      label.from = from === undefined ? to : from;
    } else if (label !== undefined && label.to === undefined) {
      label.to = from === undefined ? to : from;
    } else if (!label) {
      label = {
        id: labelId,
        from: from,
        to: to,
        typeId: this.state.labelingsDefinition.filter(
          labeling =>
            this.state.controlStates.selectedLabelingId === labeling.id
        )[0].types[0].id
      };
      labeling.labels = [...labeling.labels, label];
    } else {
      label.from = from;
      label.to = to;
    }

    let temp;
    if (label.from > label.to) {
      temp = label.from;
      label.from = label.to;
      label.to = temp;
    }

    this.forceUpdate();
  }

  onDeleteSelectedLabel() {
    let labeling = this.state.dataset.labelings.filter(
      labeling =>
        labeling.labelingId === this.state.controlStates.selectedLabelingId
    )[0];
    labeling.labels = labeling.labels.filter(
      label => label.id !== this.state.controlStates.selectedLabelId
    );
    this.setState({
      controlStates: {
        selectedLabelId: undefined,
        selectedLabelingId: this.state.controlStates.selectedLabelingId,
        selectedLabelTypeId: undefined,
        canEdit: this.state.controlStates.canEdit
      }
    });
  }

  onCanEditChanged(canEdit) {
    this.setState({
      controlStates: {
        selectedLabelId: this.state.controlStates.selectedLabelId,
        selectedLabelingId: this.state.controlStates.selectedLabelingId,
        selectedLabelTypeId: this.state.controlStates.selectedLabelTypeId,
        canEdit: canEdit
      }
    });
  }

  onFuseTimeSeries(seriesIds) {
    let dataset = { ...this.state.dataset };
    dataset.fusedSeries.push({
      id: uuidv4(),
      series: seriesIds
    });
    let fuseTimeSeriesModalState = { ...this.state.fuseTimeSeriesModalState };
    fuseTimeSeriesModalState.isOpen = false;

    this.setState({ dataset });
    this.setState({ fuseTimeSeriesModalState });
  }

  onOpenFuseTimeSeriesModal() {
    let fuseTimeSeriesModalState = { ...this.state.fuseTimeSeriesModalState };
    fuseTimeSeriesModalState.isOpen = true;

    this.setState({ fuseTimeSeriesModalState });
  }

  uuidv4() {
    return 'xxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
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
          label => label.id === this.state.controlStates.selectedLabelId
        )[0]
      : null;

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
                />
                <Button block outline onClick={this.onOpenFuseTimeSeriesModal}>
                  + Fuse Multiple Time Series
                </Button>
              </div>
            </Col>
            <Col xs={12} lg={3}>
              <div>
                <InteractionControlPanel
                  isPublished={this.state.dataset.isPublished}
                />
              </div>
              <div className="mt-3">
                <TagsPanel tags={this.state.dataset.tags} />
              </div>
              <div className="mt-3">
                <MetadataPanel
                  id={this.state.dataset.id}
                  start={this.state.dataset.start}
                  end={this.state.dataset.end}
                  email={this.state.dataset.email}
                />
              </div>
              <div className="mt-3">
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
                from={label ? label.from : null}
                to={label ? label.to : null}
                labeling={selectedLabeling}
                selectedLabelTypeId={
                  this.state.controlStates.selectedLabelTypeId
                }
                onSelectedLabelTypeIdChanged={this.onSelectedLabelTypeIdChanged}
                onDeleteSelectedLabel={this.onDeleteSelectedLabel}
                onCanEditChanged={this.onCanEditChanged}
                canEdit={this.state.controlStates.canEdit}
              />
            </Col>
            <Col />
            <CombineTimeSeriesModal
              timeSeries={this.state.dataset.timeSeries}
              onFuse={this.onFuseTimeSeries}
              isOpen={this.state.fuseTimeSeriesModalState.isOpen}
            />
          </Row>
        </div>
      </Fade>
    );
  }
}

export default view(DatasetPage);
