import React, { Component } from "react";
import { Badge, Box, Card, Group, Text } from "@mantine/core";
import "./TagsPanel.css";

class TagsPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: props.events,
    };
  }

  componentWillReceiveProps(props) {
    this.setState((state) => ({
      events: props.events,
    }));
  }

  parseTime = (timestamp) => {
    let date = new Date(timestamp);
    let hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    let minute =
      date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let second =
      date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();

    return hour + ":" + minute + ":" + second;
  };

  render() {
    let events = [...this.state.events];
    events.sort((a, b) => a.time - b.time);

    return (
      <Card>
        <Box p="sm">
          <Text fw={700}>Events</Text>
        </Box>
        <Box p="sm">
          <div className="tagsContainer">
            {events.map((event, key) => (
              <Box m="sm" key={key}>
                <Badge color="gray" variant="light">
                  <Group justify="space-between" gap="sm">
                    <Text size="xs" fw={700}>
                      {event.name},{" "}
                    </Text>
                    <Text size="xs">
                      {event.value} {event.unit}
                    </Text>
                    <Text size="xs">{this.parseTime(event.time)}</Text>
                  </Group>
                </Badge>
              </Box>
            ))}
          </div>
        </Box>
      </Card>
    );
  }
}
export default TagsPanel;
