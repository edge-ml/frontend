import React, { Component } from "react";
import { Paper, Stack, Text, Title } from "@mantine/core";

class ListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { name, description, children } = this.props;
    return (
      <Paper p="lg" radius="md" withBorder>
        <Stack gap="xs">
          <Title order={5}>{name}</Title>
          <Text c="dimmed">{description}</Text>
          <div>{children}</div>
        </Stack>
      </Paper>
    );
  }
}
export default ListItem;
