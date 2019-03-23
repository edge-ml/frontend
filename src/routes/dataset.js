import React, { Component } from 'react';
import { Col, Row, Button, Fade } from 'reactstrap';
import Request from 'request-promise';
import update from 'immutability-helper';
import { load } from 'protobufjs';
import { view } from 'react-easy-state';

import { CloudDownloadIcon } from 'react-octicons';

import State from '../state';
import Loader from '../modules/loader';
import DatasetToolbar from '../modules/datasetToolbar';
import SaveToolbar from '../modules/datasetSave';
import LabelingPanel from '../components/LabelingPanel/LabelingPanel';
import TagsPanel from '../components/TagsPanel/TagsPanel';
import ManagementPanel from '../components/ManagementPanel/ManagementPanel';
import MetadataPanel from '../components/MetadataPanel/MetadataPanel';
import InteractionControlPanel from '../components/InteractionControlPanel/InteractionControlPanel';
import XAxisPanel from '../components/XAxisPanel/XAxisPanel';
import LabelingSelectionPanel from '../components/LabelingSelectionPanel/LabelingSelectionPanel';
import TimeSeriesCollectionPanel from '../components/TimeSeriesCollectionPanel/TimeSeriesCollectionPanel';

class DatasetPage extends Component {
  constructor(props) {
    const dataset = {
      id: '0x1234',
      userId: '0x9321',
      email: 'test@test.de',
      start: Date.now() - 600000,
      end: Date.now() + 10000,
      tags: ['Alcohol', 'Medication', 'Test', 'ABC'],
      isPublished: false,
      timeSeries: [
        {
          id: '0x123434',
          name: 'VOC',
          data: [
            [Date.now() - 500000, 20],
            [Date.now() - 400000, 40],
            [Date.now() - 300000, 60],
            [Date.now() - 200000, 10],
            [Date.now() - 100000, 15],
            [Date.now() - 100000, 30],
            [Date.now(), 5]
          ]
        },
        {
          id: '0x1123992',
          name: 'SPO2',
          data: [
            [Date.now() - 500000, 50],
            [Date.now() - 450000, 12],
            [Date.now() - 400000, 40],
            [Date.now() - 300000, 30],
            [Date.now() - 200000, 18],
            [Date.now() - 100000, 34],
            [Date.now(), 80]
          ]
        }
      ],
      labelings: [
        {
          id: '0x3441234234',
          labelingId: '0x923',
          labels: [
            {
              id: '0x1234144',
              typeId: '0x1482',
              from: Date.now() - 450000,
              to: Date.now() - 400000
            },
            {
              id: '0x1481230020013',
              typeId: '0x1483',
              from: Date.now() - 300000,
              to: Date.now() - 200000
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
            color: '#FFEB3B'
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
            color: '#FFEB3B'
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
            color: '#FFEB3B'
          },
          {
            id: '0x148312512',
            name: 'Right',
            color: '#4CAF50'
          },
          {
            id: '0x14251285',
            name: 'Back',
            color: '#00BCD4'
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
            color: '#FFEB3B'
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
        selectedLabelTypeId: undefined
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
  }

  onSelectedLabelingIdChanged(selectedLabelingId) {
    this.setState({
      controlStates: {
        selectedLabelId: undefined,
        selectedLabelingId: selectedLabelingId,
        selectedLabelTypeId: undefined
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
        selectedLabelTypeId: selectedLabelTypeId
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
        selectedLabelTypeId: label.typeId
      }
    });
  }

  onLabelChanged(labelId, from, to) {
    let labeling = this.state.dataset.labelings.filter(
      labeling =>
        labeling.labelingId === this.state.controlStates.selectedLabelingId
    )[0];
    let label = labeling.labels.filter(label => label.id === labelId)[0];
    if (from < to) {
      label.from = from;
      label.to = to;
    } else {
      label.from = to;
      label.to = from;
    }
    this.forceUpdate();
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
      <div>
        <Row className="pt-3">
          <Col onMouseUp={this.mouseUpHandler} className="mr-0 pr-0">
            <div className="mb-3">
              <LabelingSelectionPanel
                labelingsDefinition={this.state.labelingsDefinition}
                selectedLabelingId={this.state.controlStates.selectedLabelingId}
                onSelectedLabelingIdChanged={this.onSelectedLabelingIdChanged}
              />
              <TimeSeriesCollectionPanel
                timeSeries={this.state.dataset.timeSeries}
                labeling={labeling}
                labelTypes={selectedLabelingTypes}
                onLabelClicked={this.onSelectedLabelChanged}
                selectedLabelId={this.state.controlStates.selectedLabelId}
                start={this.state.dataset.start}
                end={this.state.dataset.end}
                onLabelChanged={this.onLabelChanged}
              />
            </div>
          </Col>
          <Col xs={3}>
            <Fade in={this.state.fadeIn}>
              <div>
                <InteractionControlPanel
                  isPublished={this.state.dataset.isPublished}
                />
              </div>
              <div className="mt-3">
                <LabelingPanel
                  id={this.state.controlStates.selectedLabelId}
                  from={label ? label.from : null}
                  to={label ? label.to : null}
                  labelTypes={selectedLabeling.types}
                  selectedLabelTypeId={
                    this.state.controlStates.selectedLabelTypeId
                  }
                  onSelectedLabelTypeIdChanged={
                    this.onSelectedLabelTypeIdChanged
                  }
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
                <ManagementPanel />
              </div>
            </Fade>
          </Col>
        </Row>
        <Row>
          <Col xs={9}>
            <XAxisPanel />
          </Col>
          <Col xs={3} />
        </Row>
      </div>
    );
  }
}

export default view(DatasetPage);
