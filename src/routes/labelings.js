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
        isOpen: false
      }
    };

    this.toggleModal = this.toggleModal.bind(this);
  }

  toggleModal(labeling) {
    this.setState({
      modal: {
        labeling: this.state.modal.isOpened ? undefined : labeling,
        isOpen: !this.state.isOpened
      }
    });
  }

  render() {
    return (
      <Loader loading={!this.state.isReady}>
        <Container>
          <Row className="mt-3">
            <Col>
              <Table>
                <thead>
                  <tr className={'bg-light'}>
                    <th>Id</th>
                    <th>Name</th>
                    <th>Types</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.labelingsDefinition.map(labeling => (
                    <tr>
                      <th className="labelings-column" scope="row">
                        {labeling.id}
                      </th>
                      <td className="labelings-column">{labeling.name}</td>
                      <td className="labelings-column">
                        {labeling.types.map(type => (
                          <Badge
                            className={'m-1'}
                            style={{
                              backgroundColor: type.color
                            }}
                          >
                            {type.name}
                          </Badge>
                        ))}
                      </td>
                      <td>
                        <Button
                          className="btn-light mt-0"
                          block
                          onClick={e => {
                            this.toggleModal(labeling);
                          }}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button block className="btn-light">
                + Add
              </Button>
            </Col>
          </Row>
        </Container>
        <EditLabelingModal
          labeling={this.state.modal.labeling}
          isOpen={this.state.modal.isOpen}
        />
      </Loader>
    );
  }
}

export default view(LabelingsPage);
