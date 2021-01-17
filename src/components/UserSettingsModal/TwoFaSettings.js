import React, { Component } from 'react';
import { Row, Col, Input } from 'reactstrap';
import {
  init2FA,
  verify2FA
} from './../../services/ApiServices/AuthentificationServices';

class TwoFaSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      qrCode: undefined,
      token: undefined
    };
    this.onTokenChanged = this.onTokenChanged.bind(this);
  }

  onTokenChanged(e) {
    if (e.target.value.length > 6) return;
    else if (e.target.value.length === 6) {
      verify2FA(e.target.value)
        .then(data => {
          window.alert('2FA has been activated');
        })
        .catch(err => {
          console.log(err);
          window.alert(err.data.error);
        });
    }
  }

  componentDidMount() {
    init2FA().then(qrCode => {
      this.setState({
        qrCode: qrCode
      });
    });
  }

  render() {
    return (
      <Row>
        <Col>
          <img width="100%" alt="2FA QR Code" src={this.state.qrCode} />
        </Col>
        <Col style={{ marginTop: '15px' }}>
          Scan the qr-code with a supported app then enter the token from the
          app in order to activate two-factor authentication
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
    );
  }
}

export default TwoFaSettings;
