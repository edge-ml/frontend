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
      start: Date.now(),
      end: Date.now(),
      tags: ['Alcohol', 'Medication'],
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
      }
    ];

    super(props);
    this.state = {
      dataset: dataset, //props.dataset
      labelings: labelings //props.labelins
    };
  }

  render() {
    return (
      <div>
        <Row className="pt-3">
          <Col onMouseUp={this.mouseUpHandler} className="mr-0 pr-0">
            <div className="mb-3">
              <LabelingSelectionPanel />
            </div>
          </Col>
          <Col xs={3}>
            <Fade in={this.state.fadeIn}>
              <div>
                <InteractionControlPanel />
              </div>
              <div className="mt-3">
                <LabelingPanel
                  id={'0x123'}
                  from={Date.now()}
                  to={2}
                  labelings={this.state.labelings[0]}
                />
              </div>
              <div className="mt-3">
                <TagsPanel tags={['Alcohol', 'Medication']} />
              </div>
              <div className="mt-3">
                <MetadataPanel />
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
