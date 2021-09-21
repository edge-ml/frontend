import React, { Component } from 'react';
import { Button, Card, CardHeader, CardBody } from 'reactstrap';
import './ManagementPanel.css';
import HelpModal from './HelpModal';
import CreateNewDatasetModal from '../CreateNewDatasetModal/CreateNewDatasetModal';

class ManagementPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUploadModalOpen: false,
      isHelpModalOpen: false
    };

    this.toggleUploadModal = this.toggleUploadModal.bind(this);
    this.toggleHelpModal = this.toggleHelpModal.bind(this);
    this.downloadDataSet = this.downloadDataSet.bind(this);
    this.onDatasetComplete = this.onDatasetComplete.bind(this);
  }

  onDatasetComplete() {
    this.setState({
      isUploadModalOpen: false
    });
    this.props.onDatasetComplete();
  }

  toggleUploadModal() {
    this.setState({ isUploadModalOpen: !this.state.isUploadModalOpen });
    this.props.setModalOpen(!this.state.isUploadModalOpen);
  }

  toggleHelpModal() {
    this.setState({ isHelpModalOpen: !this.state.isHelpModalOpen });
  }

  downloadDataSet() {
    const dataset = this.props.dataset;
    const fileName = dataset.name;
    var csv = 'time,';
    var csv_lines = Object(); // this will be used as a dictionary, with timestamps as keys, and arrays of values as values
    var timestamps = new Set([]); // this variable will hold all timestamps as an ordered array
    var labelings = Object();
    var labelsUsed =
      typeof dataset.labelings !== 'undefined' && dataset.labelings.length > 0;

    console.log(dataset);
    console.log(this.props.labelings);

    if (labelsUsed) {
      dataset.labelings.forEach(l => {
        labelings[l.labelingId] = [];
        l.labels.forEach(label => {
          labelings[l.labelingId].push({
            name: label.name,
            start: Math.round(label.start),
            end: Math.round(label.end)
          });
        });
      });
    }

    dataset.timeSeries.forEach(t => {
      csv += 'sensor_' + t.name + '[' + t.unit + '],';
    });

    if (labelsUsed) {
      for (const [labelingId, _] of Object.entries(labelings)) {
        const labelingName = this.props.labelings.find(
          elm => elm._id === labelingId
        ).name;
        csv += 'label_' + labelingName + ',';
      }
    }

    csv = csv.slice(0, -1); // remove the single ',' at the end
    csv += '\r\n'; // this concludes the first csv line, now append data

    // collect all timestamp values in a set, and initialize csv_lines to contain empty arrays as values
    dataset.timeSeries.forEach(t => {
      t.data.forEach(d => {
        timestamps.add(d.timestamp);
        csv_lines[d.timestamp] = [];
      });
    });
    timestamps = Array.from(timestamps).sort();

    dataset.timeSeries.forEach(t => {
      var missingTimestamps = new Set(timestamps); // in the end, this array will contain all timestamps, that do not have a value -> ,, in CSV

      t.data.forEach(d => {
        csv_lines[d.timestamp].push(d.datapoint);
        missingTimestamps.delete(d.timestamp); // since it's not missing, delete the timestamp from the missing timestamps
      });

      missingTimestamps.forEach(m => {
        csv_lines[m].push(undefined); // all missing timestamps must result in empty values in the CSV (,,)
      }); // pushing undefined and later doing .join(",") will results in this behaviour
    });

    for (const [timestamp, values] of Object.entries(csv_lines)) {
      csv += timestamp + ',' + values.join(',');

      if (labelsUsed) {
        csv += ','; // when labels are used, they follow the values in a row, hence a colon is needed

        // check for each labeling, if their labels are in the bounds of the current timestamp. If yes, add the label to the CSV line, else only add ','
        for (const [_, labels] of Object.entries(labelings)) {
          var label = undefined;

          for (let l of labels) {
            if (
              l.start <= parseInt(timestamp, 10) &&
              parseInt(timestamp, 10) <= l.end
            ) {
              label = l.name;
              break;
            }
          }

          // if a label was added, add the label name and ',' to the CSV line
          if (typeof label !== 'undefined') {
            csv += label + ',';
          }
          // if NO label was added, only add ',' to the CSV line
          else {
            csv += ',';
          }
        }
        csv = csv.slice(0, -1); // remove the single ',' at the end
        csv += '\r\n';
      }
    }

    const blob = new Blob([csv], { type: 'application/csv' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = fileName + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  }

  render() {
    return (
      <Card>
        <CardHeader>
          <b>Management</b>
        </CardHeader>
        <CardBody>
          <Button
            id="buttonUploadCSV"
            block
            outline
            color="primary"
            onClick={this.toggleUploadModal}
          >
            Upload CSV
          </Button>
          <Button
            id="buttonDownloadDataset"
            block
            outline
            color="primary"
            onClick={this.downloadDataSet}
          >
            Download as CSV
          </Button>
          <Button
            id="buttonDeleteDataset"
            block
            outline
            color="danger"
            onClick={() => {
              if (window.confirm('Are you sure to delete this dataset?')) {
                this.props.onDeleteDataset();
              }
            }}
          >
            Delete Dataset
          </Button>
          <hr />
          <Button
            id="buttonOpenHelpModal"
            block
            outline
            color="secondary"
            onClick={this.toggleHelpModal}
          >
            Help
          </Button>
        </CardBody>
        <CreateNewDatasetModal
          isOpen={this.state.isUploadModalOpen}
          onCloseModal={this.toggleUploadModal}
          dataset={this.props.dataset}
          onDatasetComplete={this.onDatasetComplete}
        />
        <HelpModal
          isOpen={this.state.isHelpModalOpen}
          onCloseModal={this.toggleHelpModal}
        />
      </Card>
    );
  }
}
export default ManagementPanel;
