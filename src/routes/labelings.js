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
import { uuidv4 } from '../services/UUIDService';

class LabelingsPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      labelingsDefinition: [],
      isReady: false,
      modal: {
        labeling: undefined,
        isOpen: false,
        isNewLabeling: false
      }
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.onAddLabeling = this.onAddLabeling.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onDeleteLabeling = this.onDeleteLabeling.bind(this);
    this.onLabelingsChanged = this.onLabelingsChanged.bind(this);
    this.resetURL = this.resetURL.bind(this);
  }

  onLabelingsChanged(labelings) {
    if (!labelings) labelings = [];

    this.setState({
      labelingsDefinition: labelings,
      isReady: true
    });
  }

  componentDidMount() {
    subscribeLabelings(labelings => {
      this.onLabelingsChanged(labelings);

      if (this.props.location.pathname === '/labelings/new') {
        this.onAddLabeling();
      } else {
        const searchParams = new URLSearchParams(this.props.location.search);
        const id = searchParams.get('id');

        if (id) {
          let labeling = this.state.labelingsDefinition.filter(labeling => {
            return labeling.id === id;
          })[0];
          this.toggleModal(labeling, false);
        }
      }
    });
  }

  componentWillUnmount() {
    unsubscribeLabelings();
  }

  toggleModal(labeling, isNewLabeling) {
    if (isNewLabeling) {
      this.props.history.replace({
        pathname: '/labelings/new',
        search: null
      });
    } else {
      this.props.history.replace({
        pathname: '/labelings',
        search: '?id=' + labeling.id
      });
    }

    this.setState({
      modal: {
        labeling: this.state.modal.isOpen ? undefined : labeling,
        isOpen: !this.state.modal.isOpen,
        isNewLabeling: isNewLabeling
      }
    });
  }

  onAddLabeling() {
    this.toggleModal(
      {
        id: uuidv4(),
        name: '',
        types: []
      },
      true
    );
  }

  onCloseModal() {
    this.resetURL();

    this.setState({
      modal: {
        labeling: undefined,
        isOpen: false,
        isNewLabeling: false
      }
    });
  }

  onDeleteLabeling(labelingId) {
    let newLabelings = this.state.labelingsDefinition.filter(
      labeling => labeling.id !== labelingId
    );
    this.setState({
      labelingsDefinition: newLabelings,
      modal: {
        isOpen: false,
        labeling: undefined,
        isNewLabeling: false
      }
    });
    this.resetURL();
    updateLabelings(newLabelings);
  }

  onSave(labelingId, name, types) {
    let newLabelings =
      this.state.labelingsDefinition.filter(
        labeling => labeling.id === labelingId
      )[0] !== undefined
        ? this.state.labelingsDefinition.map(labeling =>
            labeling.id === labelingId
              ? Object.assign({}, labeling, { types: types, name: name })
              : labeling
          )
        : [
            ...this.state.labelingsDefinition,
            { id: labelingId, name: name, types: types }
          ];

    this.setState({
      labelingsDefinition: newLabelings,
      modal: {
        labeling: undefined,
        isOpen: false
      }
    });
    this.resetURL();
    updateLabelings(newLabelings);
  }

  resetURL() {
    this.props.history.replace({
      pathname: '/labelings',
      search: null
    });
  }

  render() {
    return (
      <Loader loading={!this.state.isReady}>
        <Container>
          <Row className="mt-3">
            <Col>
              <Table responsive>
                <thead>
                  <tr className={'bg-light'}>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Types</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {this.state.labelingsDefinition.map((labeling, index) => (
                    <tr key={index}>
                      <th className="labelings-column" scope="row">
                        {labeling.id}
                      </th>
                      <td
                        className={
                          labeling.name !== ''
                            ? 'labelings-column'
                            : 'labelings-column font-italic'
                        }
                      >
                        {labeling.name !== '' ? labeling.name : 'Untitled'}
                      </td>
                      <td className="labelings-column">
                        {labeling.types.map((type, index) => (
                          <Badge
                            key={index}
                            className={
                              type.name === ''
                                ? 'm-1 font-italic font-weight-normal'
                                : 'm-1'
                            }
                            style={{
                              backgroundColor: type.color
                            }}
                          >
                            {type.name !== '' ? type.name : 'Untitled'}
                          </Badge>
                        ))}
                      </td>
                      <td>
                        <Button
                          className="btn-secondary mt-0 btn-edit"
                          block
                          onClick={e => {
                            this.toggleModal(labeling, false);
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button
                block
                className="mb-5"
                color="secondary"
                outline
                onClick={this.onAddLabeling}
              >
                + Add
              </Button>
            </Col>
          </Row>
        </Container>
        <EditLabelingModal
          name={this.state.modal.labeling ? this.state.modal.labeling.name : ''}
          types={
            this.state.modal.labeling ? this.state.modal.labeling.types : []
          }
          id={this.state.modal.labeling ? this.state.modal.labeling.id : ''}
          isOpen={this.state.modal.isOpen}
          onCloseModal={this.onCloseModal}
          onDeleteLabeling={this.onDeleteLabeling}
          onSave={this.onSave}
          isNewLabeling={this.state.modal.isNewLabeling}
        />
      </Loader>
    );
  }
}

export default view(LabelingsPage);
