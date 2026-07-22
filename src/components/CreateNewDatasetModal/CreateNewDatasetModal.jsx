import React, { Component } from "react";
import classnames from "classnames";
import {
  Modal,
  Button,
  TextInput,
  Table,
} from "@mantine/core";
import DragDrop from "../Common/DragDrop";
import {
  updateDataset,
  createDatasets,
} from "../../services/ApiServices/DatasetServices";

import { processCSVBackend } from "../../services/ApiServices/CSVServices";

import {
  extendExistingDataset,
  generateLabeledDataset,
} from "../../services/CsvService";

import "./CreateNewDatasetModal.css";

import {
  addLabeling,
  getLabelings,
} from "../../services/ApiServices/LabelingServices";
import ErrorModal from "./ErrorModal";
import SpinnerButton from "../Common/SpinnerButton";

class CreateNewDatasetModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      datasets: [],
      labelings: [],
      uploadErrors: [],
      errorFiles: [],
      onUploading: false,
    };
    this.baseState = JSON.parse(JSON.stringify(this.state));
    this.onUpload = this.onUpload.bind(this);
    this.onDeleteFile = this.onDeleteFile.bind(this);
    this.onUnitChange = this.onUnitChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onError = this.onError.bind(this);
    this.onFileInput = this.onFileInput.bind(this);
    this.onDeleteTimeSeries = this.onDeleteTimeSeries.bind(this);
    this.onDatasetNameChange = this.onDatasetNameChange.bind(this);
    this.onSetAll = this.onSetAll.bind(this);
    this.onDeleteLabeling = this.onDeleteLabeling.bind(this);
    this.onKeyPressed = this.onKeyPressed.bind(this);
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyPressed, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeyPressed, false);
  }

  onKeyPressed(e) {
    switch (e.key) {
      case "Escape":
        if (!this.state.onUploading) {
          this.onCloseModal();
        }
        break;
      case "Enter":
        if (!this.state.onUploading) {
          this.onUpload();
        }
        break;
    }
  }

  onDatasetNameChange(e, fileIndex) {
    const datasets = this.state.datasets;
    datasets[fileIndex].name = e.target.value;
    this.setState({
      datasets: datasets,
    });
  }

  async onFileInput(files) {
    let results = [];
    for (let i = 0; i < files.length; ++i) {
      const formData = new FormData();
      formData.append("CSVFile", files[i]);
      const result = await processCSVBackend(formData);
      if (Array.isArray(result)) {
        this.setState({
          uploadErrors: result,
          errorFiles: files,
        });
        return;
      }
      const fileName = files[i].name;
      results.push({
        dataset: {
          ...result.datasets[0],
          name: fileName.endsWith(".csv")
            ? fileName.substring(0, fileName.length - 4)
            : fileName,
        },
        labeling: result.labelings[0],
      });
    }

    this.setState({
      files: [...this.state.files, ...files],
      datasets: [...this.state.datasets, ...results.map((e) => e.dataset)],
      labelings: [
        ...this.state.labelings,
        ...results.map((elm) => elm.labeling.map((innerElm) => innerElm)),
      ],
    });
  }

  onError(errorMsgs) {
    this.setState({
      error: errorMsgs,
    });
  }

  onCloseModal() {
    this.props.onCloseModal();
    this.setState(this.baseState);
  }

  onUnitChange(e, fileIndex, seriesIndex) {
    const datasets = this.state.datasets;
    datasets[fileIndex].timeSeries[seriesIndex].unit = e.target.value;
    this.setState({
      datasets: datasets,
    });
  }

  onNameChange(e, fileIndex, seriesIndex) {
    const datasets = this.state.datasets;
    datasets[fileIndex].timeSeries[seriesIndex].name = e.target.value;
    this.setState({
      datasets: datasets,
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
      labelings: labelings,
    });
  }

  onSetAll(fileIndex, seriesIndex) {
    const unit = this.state.datasets[fileIndex].timeSeries[seriesIndex].unit;
    const name = this.state.datasets[fileIndex].timeSeries[seriesIndex].name;
    const datasets = this.state.datasets;
    datasets.forEach((elm) => {
      if (elm.timeSeries.length > seriesIndex) {
        elm.timeSeries[seriesIndex].unit = unit;
        elm.timeSeries[seriesIndex].name = name;
      }
    });
    this.setState({
      datasets: datasets,
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
      datasets: datasets,
    });
  }

  onDeleteLabeling(fileIndex, labelingIndex) {
    const label = [...this.state.labelings[fileIndex]];
    label.splice(labelingIndex, 1);
    const labelings = this.state.labelings;
    labelings[fileIndex] = label;
    this.setState({
      labelings: labelings,
    });
  }

  async onUpload() {
    try {
      this.setState({ onUploading: true });
      const nameValid = this.state.datasets.every((elm) =>
        elm.timeSeries.every((timeElm) => timeElm.name !== "")
      );
      if (!nameValid) {
        window.alert("Every timeSeries needs a name");
        return;
      }

      const valid = this.state.datasets.every((elm) => !elm.error);
      if (!valid) {
        window.alert("Fix the errors to upload the dataset");
        return;
      }
      if (!this.props.dataset) {
        const promises = [];
        for (var i = 0; i < this.state.labelings.length; i++) {
          for (var j = 0; j < this.state.labelings[i].length; j++) {
            promises.push(
              addLabeling({
                ...this.state.labelings[i][j].labeling,
                labels: this.state.labelings[i][j].labels,
              })
            );
          }
        }
        await Promise.all(promises);
        const labelings = await getLabelings();
        const newDatasets = generateLabeledDataset(
          labelings,
          this.state.labelings,
          this.state.datasets
        );
        const data = await createDatasets(newDatasets);
        this.props.onDatasetComplete(data);
        this.setState(this.baseState);
      } else {
        const fusedDataset = extendExistingDataset(
          this.props.dataset,
          this.state.datasets
        );
        const data = await updateDataset(fusedDataset);
        this.setState(this.baseState);
        this.props.onDatasetComplete(data);
      }
      this.setState({ onUploading: false });
    } catch (e) {
      this.setState({ onUploading: false });
      if (e.status === 413) {
        window.alert("Dataset is too large");
      } else {
        window.alert("An error occurred while uploading the dataset");
      }
    }
  }

  render() {
    if (!this.props.isOpen) {
      return null;
    }
    return (
      <div>
        <Modal
          size="xl"
          opened={this.props.isOpen}
          onClose={this.onCloseModal}
          title={this.props.dataset
            ? "Add timeseries to dataset"
            : "Create new dataset"}
        >
          <Modal.Body>
            <DragDrop
              style={{ height: "100px" }}
              className="my-2 p-4"
              onFileInput={this.onFileInput}
            />
            {this.state.files.length === 0
              ? null
              : this.state.files.map((file, fileIndex) => {
                  return (
                    <div key={file}>
                      <Table key={file + fileIndex}>
                        <thead>
                          <tr>
                            <th colSpan="2" style={{ padding: "0 12px 0 0" }}>
                              <TextInput
                                label={<b>Dataset-name</b>}
                                id={"datasetName" + String(fileIndex)}
                                placeholder="Name"
                                value={this.state.datasets[fileIndex].name}
                                onChange={(e) =>
                                  this.onDatasetNameChange(e, fileIndex)
                                }
                              />
                            </th>
                            <th
                              colSpan="2"
                              style={{ textAlign: "end", paddingRight: "0px" }}
                            >
                              <Button
                                id="deleteButton"
                                color="red"
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
                              <td colSpan="3" style={{ color: "red" }}>
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
                                    <td style={{ paddingTop: 0, paddingBottom: 0 }}>
                                      <TextInput
                                        label="name"
                                        id={"nameInput" + String(fileIndex) + String(seriesIndex)}
                                        data-testid="nameInput"
                                        placeholder="Name"
                                        size="sm"
                                        value={this.state.datasets[fileIndex].timeSeries[seriesIndex].name}
                                        onChange={(e) => this.onNameChange(e, fileIndex, seriesIndex)}
                                      />
                                    </td>
                                    <td style={{ paddingTop: 0, paddingBottom: 0 }}>
                                      <TextInput
                                        label="Unit"
                                        id={"unitInput" + String(fileIndex) + String(seriesIndex)}
                                        data-testid="unitInput"
                                        placeholder="Unit"
                                        size="sm"
                                        value={this.state.datasets[fileIndex].timeSeries[seriesIndex].unit}
                                        onChange={(e) => this.onUnitChange(e, fileIndex, seriesIndex)}
                                      />
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                      <Button
                                        id="setAllButton"
                                        color="blue"
                                        size="xs"
                                        onClick={() => this.onSetAll(fileIndex, seriesIndex)}
                                      >
                                        Set all
                                      </Button>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                      <Button
                                        id="deleteButton"
                                        color="red"
                                        size="xs"
                                        onClick={() => this.onDeleteTimeSeries(fileIndex, seriesIndex)}
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
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        {this.state.labelings[fileIndex].map(
                          (labeling, labelingIndex) => {
                            return (
                              <div
                                key={labeling + labelingIndex}
                                className={classnames("labelInfo", {
                                  labelBorder: labelingIndex !== 0,
                                })}
                              >
                                <div
                                  id={"labelName" + labelingIndex}
                                  style={{ margin: "0 0.5rem", display: "inline" }}
                                >
                                  {labeling.datasetLabel.name}
                                </div>
                                <Button
                                  color="red"
                                  size="xs"
                                  style={{ margin: "0 0.5rem" }}
                                  onClick={() => this.onDeleteLabeling(fileIndex, labelingIndex)}
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
                {" "}
                <a href="/example_file.csv" download="example_file.csv">
                  Click here
                </a>{" "}
                to download an example CSV file.
              </div>
            ) : null}
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline"
              id="cancelButton"
              color="gray"
              style={{ margin: "0.25rem" }}
              onClick={this.onCloseModal}
            >
              Cancel
            </Button>

            <SpinnerButton
              id="uploadButton"
              data-testid="uploadButton"
              color="blue"
              style={{ margin: "0.25rem" }}
              onClick={this.onUpload}
              loading={this.state.onUploading}
              loadingtext="Upload..."
            >
              Upload
            </SpinnerButton>
          </Modal.Footer>
        </Modal>
        <ErrorModal
          isOpen={this.state.uploadErrors.length !== 0}
          errors={this.state.uploadErrors}
          files={this.state.errorFiles}
          onClose={() => this.setState(this.baseState)}
        />
      </div>
    );
  }
}

export default CreateNewDatasetModal;
