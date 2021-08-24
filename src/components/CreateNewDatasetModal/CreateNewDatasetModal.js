import React, { Component } from 'react';
import classnames from 'classnames';
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
import DragDrop from '../Common/DragDrop';
import {
  updateDataset,
  createDatasets
} from '../../services/ApiServices/DatasetServices';

import {
  processCSV,
  generateDataset,
  extendExistingDataset
} from '../../services/CsvService';

import './CreateNewDatasetModal.css';

import {
  addLabeling,
  subscribeLabelingsAndLabels,
  updateLabelingAndLabels
} from '../../services/ApiServices/LabelingServices';

class CreateNewDatasetModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      datasets: [],
      labelings: []
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
    this.onDatasetNameChange = this.onDatasetNameChange.bind(this);
    this.onSetAll = this.onSetAll.bind(this);
    this.onDeleteLabeling = this.onDeleteLabeling.bind(this);
  }

  onDatasetNameChange(e, fileIndex) {
    const datasets = this.state.datasets;
    datasets[fileIndex].name = e.target.value;
    this.setState({
      datasets: datasets
    });
  }

  onFileInput(files) {
    processCSV(files).then(timeData => {
      const result = generateDataset(timeData);
      var datasets = result.datasets;
      datasets = datasets.map((dataset, idx) => {
        const fileName = files[idx].name;
        dataset.name = fileName.endsWith('.csv')
          ? fileName.substring(0, fileName.length - 4)
          : fileName;
        return dataset;
      });
      this.setState({
        files: [...this.state.files, ...files],
        datasets: [...this.state.datasets, ...datasets],
        labelings: [
          ...this.state.labelings,
          ...result.labelings.map(elm => elm.map(innerElm => innerElm))
        ]
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
      datasets: [],
      files: []
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
    var labelings = [...this.state.labelings];
    files.splice(index, 1);
    datasets.splice(index, 1);
    labelings.splice(index, 1);
    this.setState({
      files: files,
      datasets: datasets,
      labelings: labelings
    });
  }

  onSetAll(fileIndex, seriesIndex) {
    const unit = this.state.datasets[fileIndex].timeSeries[seriesIndex].unit;
    const name = this.state.datasets[fileIndex].timeSeries[seriesIndex].name;
    const datasets = this.state.datasets;
    datasets.forEach(elm => {
      if (elm.timeSeries.length > seriesIndex) {
        elm.timeSeries[seriesIndex].unit = unit;
        elm.timeSeries[seriesIndex].name = name;
      }
    });
    this.setState({
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

  onDeleteLabeling(fileIndex, labelingIndex) {
    const label = [...this.state.labelings[fileIndex]];
    label.splice(labelingIndex, 1);
    const labelings = this.state.labelings;
    labelings[fileIndex] = label;
    this.setState({
      labelings: labelings
    });
  }

  resetState() {
    this.setState(this.baseState);
  }

  onUpload() {
    const nameValid = this.state.datasets.every(elm =>
      elm.timeSeries.every(timeElm => timeElm.name !== '')
    );
    if (!nameValid) {
      window.alert('Every timeSeries needs a name');
      return;
    }

    const valid = this.state.datasets.every(elm => !elm.error);
    if (!valid) {
      window.alert('Fix the errors to upload the dataset');
      return;
    }
    if (!this.props.dataset) {
      const promises = [];
      for (var i = 0; i < this.state.labelings.length; i++) {
        for (var j = 0; j < this.state.labelings[i].length; j++) {
          promises.push(
            addLabeling({
              ...this.state.labelings[i][j].labeling,
              labels: this.state.labelings[i][j].labels
            })
          );
        }
      }
      Promise.all(promises).then(() => {
        subscribeLabelingsAndLabels().then(result => {
          const labelings = result.labelings;
          const labels = result.labels;
          const currentLabeling = this.state.labelings;
          for (var i = 0; i < this.state.labelings.length; i++) {
            for (var j = 0; j < this.state.labelings[i].length; j++) {
              const datasetLabels = currentLabeling[i][j].datasetLabel.labels;
              const labelName = this.state.labelings[i][j].datasetLabel.name;
              const labelIds = labelings.find(elm => elm.name === labelName)
                .labels;
              currentLabeling[i][j].datasetLabel.labelingId = labelings.find(
                elm => elm.name === labelName
              )._id;
              for (var h = 0; h < datasetLabels.length; h++) {
                const labelName =
                  currentLabeling[i][j].datasetLabel.labels[h].name;
                const labelId = labels.find(
                  elm => labelName === elm.name && labelIds.includes(elm._id)
                )._id;
                currentLabeling[i][j].datasetLabel.labels[h].type = labelId;
              }
            }
          }
          const newDatasets = [];
          for (var i = 0; i < this.state.datasets.length; i++) {
            newDatasets.push({
              ...this.state.datasets[i],
              labelings: currentLabeling[i].map(elm => elm.datasetLabel)
            });
          }
          createDatasets(newDatasets).then(data => {
            this.resetState();
            this.props.onDatasetComplete(data);
          });
        });
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
  }

  render() {
    if (!this.props.isOpen) {
      return null;
    }
    return (
      <Modal
        className="modal-xl"
        data-testid="modal"
        isOpen={this.props.isOpen}
      >
        <ModalHeader>
          {this.props.dataset
            ? 'Add timeseries to dataset'
            : 'Create new dataset'}
        </ModalHeader>
        <ModalBody>
          <DragDrop
            style={{ height: '100px' }}
            className="my-2"
            onFileInput={this.onFileInput}
          ></DragDrop>
          {this.state.files.length === 0
            ? null
            : this.state.files.map((file, fileIndex) => {
                return (
                  <div key={file}>
                    <Table key={file + fileIndex}>
                      <thead>
                        <tr>
                          <th colSpan="2" style={{ padding: '0 12px 0 0' }}>
                            <InputGroup size="md">
                              <InputGroupAddon addonType="prepend">
                                <InputGroupText>
                                  <b>Dataset-name</b>
                                </InputGroupText>
                              </InputGroupAddon>
                              <Input
                                className="font-weight-bold"
                                id={'datasetName' + String(fileIndex)}
                                type="text"
                                placeholder="Name"
                                value={this.state.datasets[fileIndex].name}
                                onChange={e =>
                                  this.onDatasetNameChange(e, fileIndex)
                                }
                              />
                            </InputGroup>
                          </th>
                          <th
                            colSpan="2"
                            style={{ textAlign: 'end', paddingRight: '0px' }}
                          >
                            <Button
                              id="deleteButton"
                              color="danger"
                              size="md"
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
                                <tr key={file + seriesIndex}>
                                  <td
                                    style={{ paddingTop: 0, paddingBottom: 0 }}
                                  >
                                    <InputGroup size="sm">
                                      <InputGroupAddon addonType="prepend">
                                        <InputGroupText>name</InputGroupText>
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
                                  <td
                                    style={{ paddingTop: 0, paddingBottom: 0 }}
                                  >
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
                                        value={
                                          this.state.datasets[fileIndex]
                                            .timeSeries[seriesIndex].unit
                                        }
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
                                  <td style={{ textAlign: 'right' }}>
                                    <Button
                                      id="deleteButton"
                                      color="primary"
                                      size="sm"
                                      onClick={() =>
                                        this.onSetAll(fileIndex, seriesIndex)
                                      }
                                    >
                                      Set all
                                    </Button>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {this.state.labelings[fileIndex].map(
                        (labeling, labelingIndex) => {
                          return (
                            <div
                              key={labeling + labelingIndex}
                              className={classnames('labelInfo', {
                                labelBorder: labelingIndex !== 0
                              })}
                            >
                              <div
                                className="mx-2"
                                style={{ display: 'inline' }}
                              >
                                {labeling.datasetLabel.name}
                              </div>
                              <Button
                                color="danger"
                                size="sm"
                                className="mx-2"
                                onClick={() =>
                                  this.onDeleteLabeling(
                                    fileIndex,
                                    labelingIndex
                                  )
                                }
                              >
                                Delete
                              </Button>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                );
              })}
          {this.state.files.length === 0 ? (
            <div className="mt-2">
              {' '}
              <a href="/example_file.csv">Click here</a> to download an example
              CSV file.
            </div>
          ) : null}
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
