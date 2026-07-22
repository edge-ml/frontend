import React, { Component } from "react";
import { Card, Badge } from "@mantine/core";
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
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Card.Section>
          <b>Events</b>
        </Card.Section>
        <Card.Section>
          <div className="tagsContainer">
            {events.map((event, key) => (
              <div className="m-2" key={key}>
                <Badge color="gray" variant="light">
                  <span style={{ float: "left" }}>
                    <b>{event.name}, </b>
                    {event.value} {event.unit}
                  </span>
                  <span style={{ float: "right" }}>
                    {this.parseTime(event.time)}
                  </span>
                </Badge>
              </div>
            ))}
          </div>
        </Card.Section>
      </Card>
    );
  }
}
export default TagsPanel;
