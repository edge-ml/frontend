import React, { Component } from "react";
import { TextInput, Button, SimpleGrid } from "@mantine/core";
import {
  init2FA,
  verify2FA,
  reset2FA,
} from "./../../services/ApiServices/AuthentificationServices";

class TwoFaSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      qrCode: undefined,
      token: undefined,
    };
    this.onTokenChanged = this.onTokenChanged.bind(this);
    this.on2FADisable = this.on2FADisable.bind(this);
  }

  onTokenChanged(e) {
    if (e.target.value.length !== 6) return;
    verify2FA(e.target.value)
      .then((data) => {
        this.props.enable2FA();
      })
      .catch((err) => {
        window.alert(err.data);
      });
  }

  componentDidMount() {
    if (!this.props.twoFAEnabled) {
      init2FA().then((qrCode) => {
        this.setState({
          qrCode: qrCode,
        });
      });
    }
  }

  on2FADisable() {
    var doDelete = window.confirm("Do you want to really diable 2FA?");
    if (doDelete) {
      reset2FA()
        .then(() => {
          this.props.onLogout();
        })
        .catch((err) => window.alert(err.data));
    }
  }

  render() {
    return (
      <div>
        {!this.props.twoFAEnabled ? (
          <SimpleGrid cols={2}>
            <img width="100%" alt="2FA QR Code" src={this.state.qrCode} />
            <div style={{ marginTop: "15px" }}>
              Scan the qr-code with a supported app then enter the token from
              the app in order to activate two-factor authentication
              <TextInput
                autoFocus
                id="inputTwoFAToken"
                className="mt-1"
                placeholder="Token"
                style={{ textAlign: "center" }}
                onChange={this.onTokenChanged}
              />
            </div>
          </SimpleGrid>
        ) : (
          <div style={{ marginTop: "8px" }}>
            <h5 style={{ textAlign: "center" }}>2FA is activated</h5>
            <div style={{ textAlign: "center" }}>
              <Button
                id="buttonDisableTwoFA"
                color="red"
                variant="outline"
                onClick={this.on2FADisable}
              >
                Disable
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default TwoFaSettings;
