import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';

import { parseCSV } from '../../services/helpers.js';
import './ManagementPanel.css';

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
          this.props.startTime,
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
          <div className="input-group">
            <div className="custom-file">
              <input
                id="fileInput"
                accept=".csv"
                onChange={e => this.setState({ file: e.target.files[0] })}
                type="file"
                className="custom-file-input"
              />
              <label className="custom-file-label">
                {!this.state.file ? 'Choose File' : this.state.file.name}
              </label>
            </div>
          </div>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                <Input
                  addon
                  type="checkbox"
                  checked={this.state.adjustTime}
                  onChange={e =>
                    this.setState({ adjustTime: e.target.checked })
                  }
                />
              </InputGroupText>
            </InputGroupAddon>
            <Input
              defaultValue="Adjust time series start time to the dataset's start time"
              className={
                this.state.adjustTime ? 'inputChecked' : 'inputNotChecked'
              }
            />
          </InputGroup>
          <hr />
          Need help? <a href="/example_file.csv">Click here</a> to download an
          example CSV file.
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
