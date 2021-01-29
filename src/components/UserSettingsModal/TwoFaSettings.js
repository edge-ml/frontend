import React, { Component } from 'react';
import { Row, Col, Input, Button } from 'reactstrap';
import {
  init2FA,
  verify2FA,
  reset2FA
} from './../../services/ApiServices/AuthentificationServices';

class TwoFaSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      qrCode: undefined,
      token: undefined
    };
    this.onTokenChanged = this.onTokenChanged.bind(this);
    this.on2FADisable = this.on2FADisable.bind(this);
  }

  onTokenChanged(e) {
    if (e.target.value.length !== 6) return;
    verify2FA(e.target.value)
      .then(data => {
        this.props.enable2FA();
      })
      .catch(err => {
        window.alert(err.data);
      });
  }

  componentDidMount() {
    if (!this.props.twoFAEnabled) {
      init2FA().then(qrCode => {
        this.setState({
          qrCode: qrCode
        });
      });
    }
  }

  on2FADisable() {
    var doDelete = window.confirm('Do you want to really diable 2FA?');
    if (doDelete) {
      reset2FA()
        .then(() => {
          this.props.onLogout();
        })
        .catch(err => window.alert(err.data));
    }
  }

  render() {
    return (
      <div>
        {!this.props.twoFAEnabled ? (
          <Row>
            <Col>
              <img width="100%" alt="2FA QR Code" src={this.state.qrCode} />
            </Col>
            <Col style={{ marginTop: '15px' }}>
              Scan the qr-code with a supported app then enter the token from
              the app in order to activate two-factor authentication
              <Input
                autoFocus
                id="inputTwoFAToken"
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
        ) : (
          <div style={{ marginTop: '8px' }}>
            <Row>
              <Col>
                <h5 className="text-center">2FA is activated</h5>
              </Col>
            </Row>
            <Row>
              <Col className="text-center">
                <Button
                  id="buttonDisableTwoFA"
                  color="danger"
                  outline
                  onClick={this.on2FADisable}
                >
                  Disable
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </div>
    );
  }
}

export default TwoFaSettings;
