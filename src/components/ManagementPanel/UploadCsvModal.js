import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Label,
  FormGroup
} from 'reactstrap';

import { parseCSV } from '../../services/helpers.js';

class UploadCsvModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      file: null,
      adjustTime: false
    };

    this.onUpload = this.onUpload.bind(this);
  }

  onUpload() {
    let file = this.state.file;
    if (file != null) {
      const reader = new FileReader();
      reader.onload = () => {
        const obj = parseCSV(
          reader.result,
          this.state.startTime,
          this.state.adjustTime
        );

        if (obj.error) {
          alert(obj.message);
        } else {
          obj.error = undefined;
          obj.message = undefined;
          this.props.onUpload(obj);

          this.setState({ file: null, adjustTime: false });
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
          <div class="input-group">
            <div class="custom-file">
              <input
                id="fileInput"
                accept=".csv"
                onChange={e => this.setState({ file: e.target.files[0] })}
                type="file"
                class="custom-file-input"
              />
              <label class="custom-file-label">
                {!this.state.file ? 'Choose File' : this.state.file.name}
              </label>
            </div>
          </div>
          <FormGroup check>
            <Label>
              <Input
                type="checkbox"
                id="checkbox"
                onChange={e => this.setState({ adjustTime: e.target.checked })}
              />{' '}
              <span color="muted">
                adjust time series start time to the dataset's start time
              </span>
            </Label>
          </FormGroup>
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
