import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Table,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';

import {
  updateDataset,
  createDatasets
} from '../../services/ApiServices/DatasetServices';

import {
  processCSV,
  generateDataset,
  extendExistingDataset
} from '../../services/CsvService';
import { extend } from 'highcharts';

class CreateNewDatasetModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      datasets: []
    };
    this.baseState = this.state;
    this.onUpload = this.onUpload.bind(this);
    this.onDeleteFile = this.onDeleteFile.bind(this);
    this.onUnitChange = this.onUnitChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.resetState = this.resetState.bind(this);
    this.onError = this.onError.bind(this);
    this.onFileInput = this.onFileInput.bind(this);
    this.onDeleteTimeSeries = this.onDeleteTimeSeries.bind(this);
  }

  onFileInput(e) {
    const files = e.target.files;
    var datasets;
    processCSV(files).then(timeData => {
      datasets = generateDataset(timeData);
      this.setState({
        files: [...this.state.files, ...files],
        datasets: [...this.state.datasets, ...datasets]
      });
    });
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

  onUnitChange(e, fileIndex, seriesIndex) {
    const datasets = this.state.datasets;
    datasets[fileIndex].timeSeries[seriesIndex].unit = e.target.value;
    this.setState({
      datasets: datasets
    });
  }

  onNameChange(e, fileIndex, seriesIndex) {
    const datasets = this.state.datasets;
    datasets[fileIndex].timeSeries[seriesIndex].name = e.target.value;
    this.setState({
      datasets: datasets
    });
  }

  onDeleteFile(index) {
    var files = [...this.state.files];
    var datasets = [...this.state.datasets];
    files.splice(index, 1);
    datasets.splice(index, 1);
    this.setState({
      files: files,
      datasets: datasets
    });
  }

  onDeleteTimeSeries(fileIndex, seriesIndex) {
    if (this.state.datasets[fileIndex].timeSeries.length === 1) {
      this.onDeleteFile(fileIndex);
      return;
    }
    var timeSeries = [...this.state.datasets[fileIndex].timeSeries];
    timeSeries.splice(seriesIndex, 1);

    const datasets = this.state.datasets;
    datasets[fileIndex].timeSeries = timeSeries;
    this.setState({
      datasets: datasets
    });
  }

  resetState() {
    this.setState(this.baseState);
  }

  onUpload() {
    const valid = this.state.datasets.every(elm => !elm.error);
    if (!valid) {
      window.alert('Fix the errors to upload the dataset');
      return;
    }
    processCSV(this.state.files).then(timeData => {
      if (!this.props.dataset) {
        createDatasets(this.state.datasets).then(data => {
          this.resetState();
          this.props.onDatasetComplete(data);
        });
      } else {
        const fusedDataset = extendExistingDataset(
          this.props.dataset,
          this.state.datasets
        );
        updateDataset(fusedDataset).then(data => {
          this.resetState();
          this.props.onDatasetComplete(data);
        });
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
                onChange={this.onFileInput}
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
          {this.state.files.length === 0
            ? null
            : this.state.files.map((file, fileIndex) => {
                return (
                  <Table>
                    <thead>
                      <tr>
                        <th colSpan="2">
                          <b>{file.name}</b>
                        </th>
                        <th style={{ textAlign: 'end' }}>
                          <Button
                            id="deleteButton"
                            color="danger"
                            size="sm"
                            onClick={() => this.onDeleteFile(fileIndex)}
                          >
                            Delete
                          </Button>
                        </th>
                      </tr>
                    </thead>
                    {this.state.datasets[fileIndex].error ? (
                      <tbody>
                        <tr>
                          <td colSpan="3" style={{ color: 'red' }}>
                            Error: {this.state.datasets[fileIndex].error}
                          </td>
                        </tr>
                      </tbody>
                    ) : (
                      <tbody>
                        {this.state.datasets[fileIndex].timeSeries.map(
                          (timeSeries, seriesIndex) => {
                            return (
                              <tr>
                                <td style={{ paddingTop: 0, paddingBottom: 0 }}>
                                  <InputGroup size="sm">
                                    <InputGroupAddon addonType="prepend">
                                      <InputGroupText>Name</InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                      id={
                                        'nameInput' +
                                        String(fileIndex) +
                                        String(seriesIndex)
                                      }
                                      data-testid="nameInput"
                                      type="text"
                                      placeholder="Name"
                                      value={
                                        this.state.datasets[fileIndex]
                                          .timeSeries[seriesIndex].name
                                      }
                                      onChange={e =>
                                        this.onNameChange(
                                          e,
                                          fileIndex,
                                          seriesIndex
                                        )
                                      }
                                    />
                                  </InputGroup>
                                </td>
                                <td style={{ paddingTop: 0, paddingBottom: 0 }}>
                                  <InputGroup size="sm">
                                    <InputGroupAddon addonType="prepend">
                                      <InputGroupText>Unit</InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                      id={
                                        'unitInput' +
                                        String(fileIndex) +
                                        String(seriesIndex)
                                      }
                                      data-testid="unitInput"
                                      tpye="text"
                                      placeholder="Unit"
                                      bsSize="sm"
                                      onChange={e =>
                                        this.onUnitChange(
                                          e,
                                          fileIndex,
                                          seriesIndex
                                        )
                                      }
                                    />
                                  </InputGroup>
                                </td>
                                <td>
                                  <Button
                                    id="deleteButton"
                                    color="danger"
                                    size="sm"
                                    onClick={() =>
                                      this.onDeleteTimeSeries(
                                        fileIndex,
                                        seriesIndex
                                      )
                                    }
                                  >
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    )}
                  </Table>
                );
              })}
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
