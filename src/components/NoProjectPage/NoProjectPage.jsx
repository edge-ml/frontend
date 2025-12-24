import React, { Component } from "react";
import { Center, Text } from "@mantine/core";

class NoProjectPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Center h="75vh">
        <Text size="xl" fw={600}>
          {this.props.text ? (
            this.props.text
          ) : (
            <div id="noProjectPageStandardText">
              Open or create a project on the left to get started!
            </div>
          )}
        </Text>
      </Center>
    );
  }
}

export default NoProjectPage;
