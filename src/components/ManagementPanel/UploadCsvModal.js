import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  FormText
} from 'reactstrap';

class UploadCsvModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      file: null,
      adjustTime: false
    };

    this.onUpload = this.onUpload.bind(this);
  }

  parseCSV(string) {
    let obj = { error: true, message: '' };

    let lines = string.split(/\r?\n/);
    if (lines.length < 6) {
      obj.message = 'Must contain at least 1 line of data.';
      return obj;
    }

    let i = 0;
    while (lines[i].startsWith('#')) {
      let line = lines[i].split(/\s+/);
      let content = line[1].split(',');
      if (obj[content[0]] === undefined) {
        obj[content[0]] = content[1];
      } else {
        obj.message = `The metadata field ${
          content[0]
        } is defined more than once in the csv.`;
        return obj;
      }

      i++;
    }

    if (!obj.name || !obj.unit || !obj.id) {
      obj.message = 'Name, unit or id metadata missing in the csv.';
      return obj;
    }

    if (lines[i] !== 'time,data') {
      obj.message = 'Must provide both time and data in a data line.';
      return obj;
    } else {
      obj.data = [];
      i++;
    }

    let start = this.props.startTime;
    let startLine = i;
    let originalStart;
    while (i < lines.length - 1) {
      let line = lines[i].split(',');
      if (line.length < 2 || isNaN(line[0]) || isNaN(line[1])) {
        obj.message = 'Must provide valid time and data in a data line.';
        return obj;
      }

      if (i === startLine) {
        originalStart = parseFloat(line[0]);
      }

      if (this.state.adjustTime) {
        let time =
          i === startLine
            ? start
            : start + (parseFloat(line[0]) - originalStart);
        obj.data.push([time, parseFloat(line[1])]);
      } else {
        obj.data.push([parseFloat(line[0]), parseFloat(line[1])]);
      }

      i++;
    }

    obj.error = false;
    return obj;
  }

  onUpload() {
    let file = this.state.file;
    if (file != null) {
      const reader = new FileReader();
      reader.onload = () => {
        const obj = this.parseCSV(reader.result);

        if (obj.error) {
          alert(obj.message);
        } else {
          obj.error = undefined;
          obj.message = undefined;
          this.props.onUpload(obj);

          this.setState({ file: null });
          this.props.onCloseModal();
        }
      };
      reader.readAsText(file);
    }
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen}>
        <ModalHeader>{'Upload CSV'}</ModalHeader>
        <ModalBody>
          <Label for="fileInput">File</Label>
          <Input
            id="fileInput"
            type="file"
            onChange={e => this.setState({ file: e.target.files[0] })}
            accept=".csv"
          />
          <div style={{ marginTop: 10, marginLeft: 25 }}>
            <Input
              type="checkbox"
              id="checkbox"
              onChange={e => this.setState({ adjustTime: e.target.checked })}
            />{' '}
            <FormText color="muted">
              automatically adjust time according to dataset
            </FormText>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button
            color="primary"
            className="m-1 mr-auto"
            onClick={this.onUpload}
          >
            Upload
          </Button>{' '}
          <Button
            color="secondary"
            className="m-1"
            onClick={this.props.onCloseModal}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default UploadCsvModal;
