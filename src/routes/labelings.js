import React, { Component } from 'react';
import {
  Container,
  Col,
  Row,
  Table,
  Badge,
  Button,
  ButtonGroup
} from 'reactstrap';
import Request from 'request-promise';
import update from 'immutability-helper';
import { load } from 'protobufjs';
import { view } from 'react-easy-state';

import Loader from '../modules/loader';
import EditLabelingModal from '../components/EditLabelingModal/EditLabelingModal';

class LabelingsPage extends Component {
  constructor(props) {
    super(props);

    const labelingsDefinition = [
      {
        id: '0x923',
        name: 'Sleep Apnea',
        types: [
          {
            id: '0x1482',
            name: 'Apnea',
            color: '#FF6347'
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
            color: '#FF6347'
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
            color: '#FF6347'
          },
          {
            id: '0x148312512',
            name: 'Right',
            color: '#4CAF50'
          },
          {
            id: '0x14251285',
            name: 'Back',
            color: '#9400D3'
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
            color: '#FF6347'
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

    this.state = {
      labelingsDefinition: labelingsDefinition,
      isReady: true,
      modal: {
        labeling: undefined,
        isOpen: false,
        isNewLabeling: false
      }
    };

    this.toggleModal = this.toggleModal.bind(this);
    this.onAddLabeling = this.onAddLabeling.bind(this);
    this.uuidv4 = this.uuidv4.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onDeleteLabeling = this.onDeleteLabeling.bind(this);
  }

  toggleModal(labeling, isNewLabeling) {
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
        id: this.uuidv4(),
        name: '',
        types: []
      },
      true
    );
  }

  onCloseModal() {
    this.setState({
      modal: {
        labeling: undefined,
        isOpen: false,
        isNewLabeling: false
      }
    });
  }

  onDeleteLabeling(labelingId) {
    this.setState({
      labelingsDefinition: this.state.labelingsDefinition.filter(
        labeling => labeling.id !== labelingId
      ),
      modal: {
        isOpen: false,
        labeling: undefined,
        isNewLabeling: false
      }
    });
  }

  onSave(labelingId, name, types) {
    this.setState({
      labelingsDefinition:
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
            ],
      modal: {
        labeling: undefined,
        isOpen: false
      }
    });
  }

  uuidv4() {
    return 'xxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
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
                  {this.state.labelingsDefinition.map(labeling => (
                    <tr>
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
                        {labeling.types.map(type => (
                          <Badge
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
                          className="btn-light mt-0"
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
