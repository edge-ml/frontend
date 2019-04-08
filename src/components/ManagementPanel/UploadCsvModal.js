import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label
} from 'reactstrap';

class UploadCsvModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      file: null
    };

    this.onUpload = this.onUpload.bind(this);
  }

  parseCSV(string) {
    let obj = { error: true, message: '' };

    let array = string.split(/\r?\n/);
    if (array.length < 6) {
      obj.message = 'Must contain at least 1 line of data.';
      return obj;
    }

    for (let i = 0; i < 3; i++) {
      let line = array[i].split(/\s+/);
      if (line.length < 2 || line[0] !== '#') {
        obj.message = 'Must specify id, name and unit in comment.';
        return obj;
      }

      let content = line[1].split(',');
      if (
        content.length < 2 ||
        (content[0] !== 'name' && content[0] !== 'unit' && content[0] !== 'id')
      ) {
        obj.message = 'Must specify id, name and unit in comment.';
        return obj;
      } else {
        if (content[0] === 'name' && obj.name === undefined) {
          obj.name = content[1];
        } else if (content[0] === 'unit' && obj.unit === undefined) {
          obj.unit = content[1];
        } else if (content[0] === 'id' && obj.id === undefined) {
          obj.id = content[1];
        } else {
          obj.message = 'Must specify id, name and unit in comment.';
          return obj;
        }
      }
    }

    let line = array[3].split(',');
    if (line.length < 2 || line[0] !== 'time' || line[1] !== 'data') {
      obj.message = 'Must provide both time and data in a data line.';
      return obj;
    } else {
      obj.data = [];
    }

    for (let i = 4; i < array.length - 1; i++) {
      let line = array[i].split(',');
      if (line.length < 2 || isNaN(line[0]) || isNaN(line[1])) {
        obj.message = 'Must provide valid time and data in a data line.';
        return obj;
      }

      obj.data.push([parseFloat(line[0]), parseFloat(line[1])]);
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
