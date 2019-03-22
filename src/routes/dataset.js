import React, { Component } from 'react';
import { Col, Row, Button, Fade } from 'reactstrap';
import Request from 'request-promise';
import update from 'immutability-helper';
import { load } from 'protobufjs';
import { view } from 'react-easy-state';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

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

class DatasetPage extends Component {
  constructor(props) {
    const dataset = {
      id: '0x1234',
      userId: '0x9321',
      email: 'test@test.de',
      start: Date.now(),
      end: Date.now(),
      tags: ['Alcohol', 'Medication', 'Test', 'ABC'],
      isPublished: false,
      timeSeries: [],
      labels: []
    };

    const labelings = [
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
            color: '#4CAF50'
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
      }
    ];

    super(props);
    this.state = {
      dataset: dataset, //props.dataset
      labelings: labelings,
      controlStates: {
        selectedLabelId: undefined,
        selectedLabelingId: labelings[0].id,
        selectedLabelTypeId: undefined
      }
    };

    this.onSelectedLabelingIdChanged = this.onSelectedLabelingIdChanged.bind(
      this
    );
    this.onSelectedLabelTypeIdChanged = this.onSelectedLabelTypeIdChanged.bind(
      this
    );
  }

  onSelectedLabelingIdChanged(selectedLabelingId) {
    this.setState({
      controlStates: {
        selectedLabelingId: selectedLabelingId,
        selectedLabelTypeId: undefined
      }
    });
  }

  onSelectedLabelTypeIdChanged(selectedLabelTypeId) {
    this.setState({
      controlStates: {
        selectedLabelingId: this.state.controlStates.selectedLabelingId,
        selectedLabelTypeId: selectedLabelTypeId
      }
    });
  }

  render() {
    var selectedLabeling = this.state.labelings.filter(
      labeling => labeling.id === this.state.controlStates.selectedLabelingId
    )[0];

    return (
      <div>
        <Row className="pt-3">
          <Col onMouseUp={this.mouseUpHandler} className="mr-0 pr-0">
            <div className="mb-3">
              <LabelingSelectionPanel
                labelings={this.state.labelings}
                selectedLabelingId={this.state.controlStates.selectedLabelingId}
                onSelectedLabelingIdChanged={this.onSelectedLabelingIdChanged}
              />
            </div>
          </Col>
          <Col xs={3}>
            <Fade in={this.state.fadeIn}>
              <div>
                <InteractionControlPanel />
              </div>
              <div className="mt-3">
                <LabelingPanel
                  id={this.state.controlStates.selectedLabelId}
                  from={Date.now()}
                  to={2}
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
