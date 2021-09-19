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
import './BleNotActivated.css';

class BleNotActivated extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="bleNotActivatedPage">
        <h3>Bluetooth is currently not activated in your Browser</h3>
        <h4>
          You can use this feature by enabling experimental features in your
          browser. Click{' '}
          <a
            target="_blank"
            href="https://support.google.com/chrome/answer/10612145?hl=en"
          >
            here
          </a>{' '}
          to learn how to do so in Chrome
        </h4>
      </div>
    );
  }
}

export default BleNotActivated;
