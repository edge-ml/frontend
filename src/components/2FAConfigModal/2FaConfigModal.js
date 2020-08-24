import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Table,
  Col,
  Row
} from 'reactstrap';

import { verify2FA } from '../../services/ApiServices/AuthentificationServices';

class TwoFAconfigModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      qrCode: undefined
    };
    this.onTokenChanged = this.onTokenChanged.bind(this);
  }

  onTokenChanged(e) {
    if (e.target.value.length > 6) return;
    else if (e.target.value.length === 6) {
      verify2FA(this.props.accessToken, e.target.value, data => {
        if (!data.err) {
          this.props.setAccessToken(data);
          window.alert('2FA has been activated');
          this.props.on2FAModalClose();
        } else {
          window.alert('2FA activation failed');
        }
      });
    }
  }

  render() {
    return (
      <Modal isOpen={this.props.isOpen}>
        <ModalHeader>Configure 2FA</ModalHeader>
        <ModalBody>
          <Row>
            <Col>
              <img width="100%" alt="2FA QR Code" src={this.props.qrCode} />
            </Col>
            <Col>
              Scan the qr-code with a supported app then enter the token from
              the app in order to activate two-factor authentication
              <Input
                autoFocus
                className={'mt-1'}
                placeholder="Token"
                style={{ textAlign: 'center' }}
                onChange={this.onTokenChanged}
                ref={input => {
                  this.tokenInput = input;
                }}
              />
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            className="m-1"
            onClick={this.props.on2FAModalClose}
          >
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default TwoFAconfigModal;
