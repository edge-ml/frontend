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
              labelingId: '0x923',
              labels: [
                {
                  id: '1',
                  typeId: '0x1482',
                  from: now - 450000,
                  to: now - 400000
                },
                {
                  id: '2',
                  typeId: '0x1483',
                  from: now - 300000,
                  to: now - 200000
                }
              ]
            }
          ]
        };

    const labelingsDefinition = [
      {
        id: '0x923',
        name: 'Sleep Apnea',
        types: [
          {
            id: '0x1482',
            name: 'Apnea',
            color: 'orange'
          },
          {
            id: '0x1483',
            name: 'Hypopnea',
            color: '#EC407A'
          },
          {
            id: '0x1485',
            name: 'Noise',
            color: '#00BCD4'
          }
        ]
      },
      {
        id: '0x924',
        name: 'Sleep Stages',
        types: [
          {
            id: '0x14812',
            name: 'Awake',
            color: 'orange'
          },
          {
            id: '0x1483123',
            name: 'Light',
            color: '#4CAF50'
          },
          {
            id: '0x148571235',
            name: 'Deep',
            color: '#00BCD4'
          },
          {
            id: '0x17865485',
            name: 'REM',
            color: '#AB61CD'
          }
        ]
      },
      {
        id: '0x92353',
        name: 'Sleep Position',
        types: [
          {
            id: '0x14853462',
            name: 'Left',
            color: 'orange'
          },
          {
            id: '0x148312512',
            name: 'Right',
            color: '#4CAF50'
          },
          {
            id: '0x14251285',
            name: 'Back',
            color: 'purple'
          },
          {
            id: '0x11200192334',
            name: 'Belly',
            color: '#00BCD4'
          }
        ]
      },
      {
        id: '0x92355453',
        name: 'Sleep Movement',
        types: [
          {
            id: '0x14853462',
            name: 'Low',
            color: 'orange'
          },
          {
            id: '0x148312512',
            name: 'Medium',
            color: '#4CAF50'
          },
          {
            id: '0x14251285',
            name: 'High',
            color: '#00BCD4'
          }
        ]
      }
    ];

    super(props);
    this.state = {
      dataset: dataset, //props.dataset
      labelingsDefinition: labelingsDefinition,
      controlStates: {
        selectedLabelId: undefined,
        selectedLabelingId: labelingsDefinition[0].id,
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

  render() {
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
                id={this.state.controlStates.selectedLabelId}
                from={label ? label.from : null}
                to={label ? label.to : null}
                labelTypes={selectedLabeling.types}
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
