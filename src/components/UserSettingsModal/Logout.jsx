import React, { Component } from "react";
import { Button, Stack, Text } from "@mantine/core";

import { validateEmail } from "./../../services/helpers";
import { changeUserMail } from "./../../services/ApiServices/AuthentificationServices";

class Logout extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Stack align="flex-start" gap={4}>
        <Text size="xs">Click here to logout now.</Text>
        <Button color="red" mt="xs" onClick={this.props.onLogout}>
          Logout
        </Button>
      </Stack>
    );
  }
}

export default Logout;
