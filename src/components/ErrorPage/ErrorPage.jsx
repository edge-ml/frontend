import React, { Component } from "react";
import { Anchor, Stack, Text, Title } from "@mantine/core";

class ErrorPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Stack align="center" pt={100}>
        <Title order={1} size={70}>
          {this.props.match.params.error}
        </Title>
        {this.props.match.params.errorText ? (
          <Title order={2}>{this.props.match.params.errorText}</Title>
        ) : null}
        <Text pt="md">
          The page you are looking for doesn't exist or an other error occured.
        </Text>
        <Text pt="md">
          If you want to try again click{" "}
          <Anchor href="/" style={{ whiteSpace: "pre-wrap" }}>
            here
          </Anchor>
          .
        </Text>
      </Stack>
    );
  }
}

export default ErrorPage;
