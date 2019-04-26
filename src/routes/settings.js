import React, { Component } from 'react';
import { Container, Col, Row, Table, Badge, Button } from 'reactstrap';
import { view } from 'react-easy-state';

import Loader from '../modules/loader';
import EditLabelingModal from '../components/EditLabelingModal/EditLabelingModal';

import {
  subscribeLabelings,
  updateLabelings,
  unsubscribeLabelings
} from '../services/SocketService';

class SettingsPage extends Component {
  constructor(props) {
    super(props);

    this.onAddUser = this.onAddUser.bind(this);
  }

  onAddUser() {}

  render() {
    return (
      <Loader>
        <Container>
          <Row className="mt-3">
            <Col>
              <Table responsive>
                <thead>
                  <tr className={'bg-light'}>
                    <th>Username</th>
                    <th>isAdmin</th>
                    <th>Registered</th>
                    <th />
                  </tr>
                </thead>
                <tbody />
              </Table>
              <Button
                block
                className="mb-5"
                color="secondary"
                outline
                onClick={this.onAddUser}
              >
                + Add
              </Button>
            </Col>
          </Row>
        </Container>
      </Loader>
    );
  }
}

export default view(SettingsPage);
