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

import {
  updateDataset,
  createDataset
} from '../../services/ApiServices/DatasetServices';

class CreateNewDatasetModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      units: [],
      names: []
    };
    this.onUpload = this.onUpload.bind(this);
    this.processCSV = this.processCSV.bind(this);
    this.onDeleteFile = this.onDeleteFile.bind(this);
    this.onUnitChange = this.onUnitChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.processNewDataset = this.processNewDataset.bind(this);
    this.updateDataSet = this.updateDataSet.bind(this);
    this.generateTimeSeries = this.generateTimeSeries.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
  }

  onCloseModal() {
    this.setState(
      {
        files: [],
        units: [],
        names: []
      },
      this.props.onCloseModal
    );
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

  onDeleteFile(e) {
    var array = [...this.state.files];
    array.splice(e.target.id, 1);
    this.setState({
      files: array
    });
  }

  generateTimeSeries(timeData) {
    var timeSeries = [];
    var i = 0;
    var obj = {};
    for (i = 0; i < timeData.length; i++) {
      obj = {
        name: this.state.names[i],
        unit: this.state.units[i],
        offset: 0,
        start: timeData[i][0][0],
        end: timeData[i][timeData[i].length - 1][0]
      };
      var j = 0;
      var samplingRate = timeData[i][1][0] - timeData[i][0][0];
      var data = [];
      for (j = 0; j < timeData[i].length; j++) {
        data.push(timeData[i][j][1]);
        if (
          j !== 0 &&
          timeData[i][j][0] - timeData[i][j - 1][0] !== samplingRate
        ) {
          window.alert(
            'Error: The sampling rate of the dataset is not consistent'
          );
          return;
        }
      }
      obj.samplingRate = samplingRate;
      obj.data = data;
      timeSeries.push(obj);
    }
    return timeSeries;
  }

  calculateStartEndTimes(timeSeries) {
    var min = timeSeries[0].start;
    var max = timeSeries[0].end;
    /*var i = 1;
    for (i = 1; i < timeSeries.length; i++) {
      if (min > timeSeries[i].start) {
        min = timeSeries[i].start;
      }
      if (max < timeSeries[i].end) {
        max = timeSeries[i].end;
      }
    }*/
    return { start: min, end: max };
  }

  processNewDataset(timeData) {
    var timeSeries = this.generateTimeSeries(timeData);
    if (timeSeries === undefined) {
      return;
    }
    var startEnd = this.calculateStartEndTimes(timeSeries);

    var datasetObj = {
      start: startEnd.start,
      end: startEnd.end,
      timeSeries: timeSeries
    };
    createDataset(this.props.accessToken, datasetObj).then(data => {
      this.props.onDatasetComplete(data);
    });
  }

  updateDataSet(timeData) {
    var timeSeries = this.generateTimeSeries(timeData);
    var dataset = this.props.dataset;
    dataset.timeSeries.push(...timeSeries);

    updateDataset(
      this.props.accessToken,
      dataset,
      this.props.onDatasetComplete
    );
  }

  processCSV(files, callback) {
    var timeData = [];
    var i = 0;
    for (i = 0; i < files.length; i++) {
      let file = this.state.files[i];
      const reader = new FileReader();
      reader.onload = () => {
        var res = reader.result;
        var allTextLines = res.split(/\r\n|\n/);
        if (allTextLines[allTextLines.length - 1] === '') {
          allTextLines.pop();
        }
        var lines = [];
        for (var i = 0; i < allTextLines.length; i++) {
          var data = allTextLines[i].split(',');
          var tarr = [];
          for (var j = 0; j < data.length; j++) {
            tarr.push(parseInt(data[j], 10));
          }
          lines.push(tarr);
        }
        timeData.push(lines);
        if (timeData.length === this.state.files.length) {
          if (!this.props.dataset) {
            this.processNewDataset(timeData, callback);
          } else {
            this.updateDataSet(timeData, callback);
          }
        }
      };
      reader.readAsText(file);
    }
  }

  onUpload() {
    const func = this.props.onDatasetComplete
      ? this.props.onDatasetComplete
      : () => {
          console.log('no function');
        };
    this.processCSV(this.state.files, func);
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen}>
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
                        <b>{file.name}</b>
                      </td>
                      <td>
                        <Input
                          key={index}
                          type="text"
                          placeholder="Name"
                          bsSize="sm"
                          onChange={e => this.onNameChange(e, index)}
                        />
                      </td>
                      <td>
                        <Input
                          key={index}
                          tpye="text"
                          placeholder="Unit"
                          bsSize="sm"
                          onChange={e => this.onUnitChange(e, index)}
                        />
                      </td>
                      <td>
                        <Button
                          id={index}
                          color="danger"
                          size="sm"
                          onClick={this.onDeleteFile}
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
            color="primary"
            className="m-1 mr-auto"
            onClick={this.onUpload}
          >
            Upload
          </Button>{' '}
          <Button color="secondary" className="m-1" onClick={this.onCloseModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default CreateNewDatasetModal;
