import React, { Component } from 'react';
import { Col, Row, Button, ButtonGroup } from 'reactstrap';
import { view } from 'react-easy-state';
import { ClippyIcon, CheckIcon } from 'react-octicons';
import Request from 'request-promise';

import State from '../state';

class DatasetSaver extends Component {
  constructor(props) {
    super(props);
    this.saveHandler = this.saveHandler.bind(this);
  }

  saveHandler(e) {
    // serialize
    const bands = State.datasetPage.chart.xAxis.plotLinesAndBands.filter(
      elem => elem.id.split('_')[0] === `band`
    );

    if (bands.length === 0) {
      return;
    }

    State.datasetPage.saveToolbar.saving = true;
    State.datasetPage.saveToolbar.disabled = true;

    const res = [];

    for (let band of bands) {
      const elem = {
        from: band.options.from,
        to: band.options.to,
        state: State.datasetPage.states[band.state].name.toLowerCase()
      };

      // correct mirrored bands
      if (!(elem.from > elem.to)) {
        [elem.from, elem.to] = [elem.to, elem.from];
      }

      res.push(elem);
    }

    const options = {
      method: 'POST',
      url: `${State.edge}/dataset/${this.props.datasetID}/annotate`,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('id_token')}`
      },
      body: res,
      json: true
    };

    Request(options)
      .then(() => {
        State.datasetPage.saveToolbar.saved = true;

        setTimeout(() => {
          State.datasetPage.saveToolbar = {
            saving: false,
            saved: false,
            disabled: false
          };
        }, 2500);
      })
      .catch(e => {
        console.error(e);
      });
  }

  componentDidMount() {}

  render() {
    if (State.datasetPage.edit.unlocked) {
      return (
        <Row className="clearfix">
          <Col>
            <ButtonGroup className="float-right save-buttongroup">
              <Button
                outline
                color="success"
                onClick={this.saveHandler}
                disabled={
                  State.datasetPage.saveToolbar.disabled ||
                  State.datasetPage.chart === null
                }
              >
                {State.datasetPage.saveToolbar.saving ? (
                  State.datasetPage.saveToolbar.saved ? (
                    <CheckIcon className="svg-green save-button" />
                  ) : (
                    '...'
                  )
                ) : (
                  <a>
                    <ClippyIcon className="svg-green svg-mirrored" /> Save
                    Annotation
                  </a>
                )}
              </Button>
            </ButtonGroup>
          </Col>
        </Row>
      );
    } else {
      return null;
    }
  }
}

export default view(DatasetSaver);
