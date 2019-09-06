import React, { Component } from 'react';
import {
  Col,
  Row,
  Button,
  ButtonGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import Request from 'request-promise';
import update from 'immutability-helper';
import BootstrapTable from 'react-bootstrap-table-next';
import { TrashcanIcon, BookIcon } from 'react-octicons';
import { view } from 'react-easy-state';

import State from '../state';
import Loader from '../modules/loader';

import {
  subscribeDatasets,
  unsubscribeDatasets,
  deleteDataset
} from '../services/SocketService';
import './styles/styles.css';

class ListPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalID: null,
      modal: false,
      ready: false,
      rows: [],
      columns: [
        {
          dataField: 'id',
          text: 'ID',
          formatter: (cell, row) => row['_id']
        },
        {
          dataField: 'startTime',
          text: 'Start Time',
          sort: true,
          sortFunc: (a, b, order, dataField, rowA, rowB) => {
            if (order === 'desc') {
              return rowB.start - rowA.start;
            } else {
              return rowA.start - rowB.start;
            }
          },
          formatter: (cell, row) => {
            const date = new Date(row.start);
            return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
          }
        },
        {
          dataField: 'user',
          text: 'UserID',
          formatter: (cell, row) => row.userId
        },
        {
          dataField: 'action',
          text: 'Action',
          formatter: (cell, row) => (
            <ButtonGroup className="list-buttongroup">
              <Button
                outline
                className="button-toolbar-delete"
                color="danger"
                onClick={e => {
                  this.deleteHandler(row['_id']);
                  e.preventDefault();
                }}
              >
                <TrashcanIcon className="svg-red" /> Delete
              </Button>
              <Button
                outline
                className="button-toolbar-delete"
                color="info"
                id={`button-view-${row['_id']}`}
                onClick={e => {
                  this.props.history.push({
                    pathname: `datasets/${row['_id']}`,
                    state: { dataset: row }
                  });
                  e.preventDefault();
                }}
              >
                <BookIcon className="svg-teal" /> View
              </Button>
            </ButtonGroup>
          )
        }
      ],
      defaultSorted: [
        {
          dataField: 'startTime',
          order: 'desc'
        }
      ],
      loading: true
    };
    this.deleteHandler = this.deleteHandler.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.modalDeleteHandler = this.modalDeleteHandler.bind(this);
    this.onDatasetsChanged = this.onDatasetsChanged.bind(this);
  }

  deleteHandler(id) {
    this.setState({
      modalID: id,
      modal: !this.state.modal
    });
  }

  modalDeleteHandler() {
    if (this.state.modalID === null) {
      this.toggleModal();
      return;
    }

    deleteDataset(this.state.modalID, err => {
      window.alert(err);
      return;
    });

    const index = this.state.rows.findIndex(
      row => row['_id'] === this.state.modalID
    );
    this.state.rows.splice(index, 1);

    this.setState({
      modalID: null,
      modal: false,
      rows: this.state.rows
    });
  }

  toggleModal() {
    this.setState({
      modal: !this.state.modal
    });
  }

  onDatasetsChanged(datasets) {
    if (!datasets) return;

    let i = 0;
    datasets.forEach(dataset => {
      dataset.key = i;
      i++;
    });

    this.setState({
      rows: datasets,
      ready: true
    });
  }

  componentDidMount() {
    subscribeDatasets(this.onDatasetsChanged);
  }

  componentWillUnmount() {
    unsubscribeDatasets();
  }

  render() {
    return (
      <Loader loading={!this.state.ready}>
        <Col>
          <br />
          <Row>
            <BootstrapTable
              className="ListTable datasetTable"
              bootstrap4={true}
              loading={this.state.loading}
              keyField="key"
              defaultSorted={this.state.defaultSorted}
              data={this.state.rows}
              columns={this.state.columns}
              hover={false}
            />
            <Modal
              isOpen={this.state.modal}
              toggle={this.toggleModal}
              className={this.props.className}
            >
              <ModalHeader toggle={this.toggleModal}>
                Delete Dataset
              </ModalHeader>
              <ModalBody>
                Are you sure to delete dataset <b>{this.state.modalID}</b>?
              </ModalBody>
              <ModalFooter>
                <Button
                  outline
                  color="danger"
                  onClick={this.modalDeleteHandler}
                >
                  Yes
                </Button>{' '}
                <Button outline color="secondary" onClick={this.toggleModal}>
                  No
                </Button>
              </ModalFooter>
            </Modal>
          </Row>
        </Col>
      </Loader>
    );
  }
}

export default view(ListPage);
