import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Table
} from 'reactstrap';

import ReactTooltip from 'react-tooltip';

import {
  updateDataset,
  createDataset
} from '../../services/ApiServices/DatasetServices';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

import {
  generateTimeSeries,
  calculateStartEndTimes,
  processCSV
} from '../../services/CsvService';

class CreateNewDatasetModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      units: [],
      names: [],
      error: undefined
    };
    this.onUpload = this.onUpload.bind(this);
    this.onDeleteFile = this.onDeleteFile.bind(this);
    this.onUnitChange = this.onUnitChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.processNewDataset = this.processNewDataset.bind(this);
    this.extendDataset = this.extendDataset.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.resetState = this.resetState.bind(this);
    this.onError = this.onError.bind(this);
  }

  onError(errorMsgs) {
    this.setState({
      error: errorMsgs
    });
  }

  onCloseModal() {
    this.props.onCloseModal();
    this.setState({
      files: [],
      units: [],
      names: []
    });
  }

  onUnitChange(e, index) {
    var array = [...this.state.units];
    array[index] = e.target.value;
    this.setState({
      units: array
    });
  }

  onNameChange(e, index) {
    var array = [...this.state.names];
    array[index] = e.target.value;
    this.setState({
      names: array
    });
  }

  onDeleteFile(index) {
    var files = [...this.state.files];
    var names = [...this.state.names];
    var units = [...this.state.units];
    files.splice(index, 1);
    names.splice(index, 1);
    units.splice(index, 1);
    if (this.state.error) {
      var error = [...this.state.error];
      error.splice(index, 1);
      if (error.join('') === '') {
        error = undefined;
      }
    }
    this.setState({
      files: files,
      names: names,
      units: units,
      error: error
    });
  }

  resetState() {
    this.setState({
      files: [],
      names: [],
      units: []
    });
  }

  processNewDataset(timeData) {
    var timeSeries = generateTimeSeries(
      timeData,
      this.state.names,
      this.state.units
    );
    if (timeSeries.err) {
      this.onError(timeSeries.err);
      return;
    }
    if (timeSeries === undefined) {
      return;
    }
    var startEnd = calculateStartEndTimes(timeSeries);
    var datasetObj = {
      start: startEnd.start,
      end: startEnd.end,
      timeSeries: timeSeries
    };
    createDataset(datasetObj).then(data => {
      this.resetState();
      this.props.onDatasetComplete(data);
    });
  }

  extendDataset(timeData) {
    var timeSeries = generateTimeSeries(
      timeData,
      this.state.names,
      this.state.units
    );
    if (timeSeries.err) {
      this.onError(timeSeries.err);
      return;
    }
    var dataset = this.props.dataset;
    dataset.timeSeries.push(...timeSeries);
    updateDataset(dataset).then(data => {
      this.resetState();
      this.props.onDatasetComplete(data);
    });
  }

  onUpload() {
    processCSV(this.state.files).then(timeData => {
      if (!this.props.dataset) {
        this.processNewDataset(timeData);
      } else {
        this.extendDataset(timeData);
      }
    });
  }

  render() {
    return (
      <Modal data-testid="modal" isOpen={this.props.isOpen}>
        <ModalHeader>
          {this.props.dataset
            ? 'Add timeseries to dataset'
            : 'Create new dataset'}
        </ModalHeader>
        <ModalBody>
          <div className="input-group">
            <div className="custom-file">
              <input
                id="fileInput"
                data-testid="fileInput"
                accept=".csv"
                onChange={e =>
                  this.setState({
                    files: [...this.state.files, ...e.target.files],
                    names: new Array(e.target.files.length),
                    units: new Array(e.target.files.length)
                  })
                }
                type="file"
                multiple
                className="custom-file-input"
              />
              <label className="custom-file-label">
                {this.state.files.length === 0
                  ? 'Choose File'
                  : this.state.files.length + ' files selected'}
              </label>
            </div>
          </div>
          {this.state.files.length === 0 ? null : (
            <Table responsive>
              <thead>
                <tr className="bg-light">
                  <th>FileName</th>
                  <th>TimeSeries Name</th>
                  <th>TimeSeries Unit</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {this.state.files.map((file, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <b>
                          {file.name.substring(0, 14) +
                            (file.name.length <= 14 ? '' : '...')}
                        </b>
                        {this.state.error && this.state.error[index] ? (
                          <div>
                            <FontAwesomeIcon
                              style={{ color: 'red' }}
                              icon={faExclamationTriangle}
                              className="mr-2 fa-xs"
                              data-tip="Error"
                              data-for={'tooltip' + index}
                            />
                            <ReactTooltip
                              id={'tooltip' + index}
                              getContent={() => {
                                return this.state.error[index];
                              }}
                            />
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <Input
                          id={'nameInput' + index}
                          data-testid="nameInput"
                          type="text"
                          placeholder="Name"
                          bsSize="sm"
                          onChange={e => this.onNameChange(e, index)}
                        />
                      </td>
                      <td>
                        <Input
                          id={'unitInput' + index}
                          data-testid="unitInput"
                          tpye="text"
                          placeholder="Unit"
                          bsSize="sm"
                          onChange={e => this.onUnitChange(e, index)}
                        />
                      </td>
                      <td>
                        <Button
                          id="deleteButton"
                          color="danger"
                          size="sm"
                          onClick={() => this.onDeleteFile(index)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            id="uploadButton"
            data-testid="uploadButton"
            color="primary"
            className="m-1 mr-auto"
            onClick={this.onUpload}
          >
            Upload
          </Button>
          {this.state.error ? (
            <div className="m - 1 mr-auto" style={{ color: 'red' }}>
              {'Fix errors to upload data'}
            </div>
          ) : null}

          <Button
            id="cancelButton"
            olor="secondary"
            className="m-1"
            onClick={this.onCloseModal}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default CreateNewDatasetModal;
