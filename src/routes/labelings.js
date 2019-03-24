import React, { Component } from 'react';
import { Col, Row, Button, Fade, BootstrapTable } from 'reactstrap';
import Request from 'request-promise';
import update from 'immutability-helper';
import { load } from 'protobufjs';
import { view } from 'react-easy-state';

import Loader from '../modules/loader';

class LabelingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labelings: props.labelings,
      isReady: true
    };
  }

  render() {
    return (
      <Loader loading={!this.state.isReady}>
        <Row />
      </Loader>
    );
  }
}

export default view(LabelingsPage);
