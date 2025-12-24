import React, { Component } from "react";
import { Box, Button, Grid, Text, TextInput, Title } from "@mantine/core";
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
      <Box>
        {!this.props.twoFAEnabled ? (
          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <img width="100%" alt="2FA QR Code" src={this.state.qrCode} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }} mt="md">
              <Text size="sm">
                Scan the qr-code with a supported app then enter the token from
                the app in order to activate two-factor authentication
              </Text>
              <TextInput
                autoFocus
                id="inputTwoFAToken"
                placeholder="Token"
                style={{ textAlign: "center" }}
                onChange={this.onTokenChanged}
                ref={(input) => {
                  this.tokenInput = input;
                }}
                mt="xs"
              />
            </Grid.Col>
          </Grid>
        ) : (
          <Box mt="sm">
            <Title order={5} ta="center">
              2FA is activated
            </Title>
            <Box mt="sm" style={{ textAlign: "center" }}>
              <Button
                id="buttonDisableTwoFA"
                color="red"
                variant="outline"
                onClick={this.on2FADisable}
              >
                Disable
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    );
  }
}

export default TwoFaSettings;
