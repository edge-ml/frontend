import React, { Component } from "react";
import { Box, Divider, Grid, Paper, Text, Title } from "@mantine/core";
import "./BleNotActivated.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChrome, faEdge } from "@fortawesome/free-brands-svg-icons";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

class BleNotActivated extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="bleNotActivatedPage">
        <Paper shadow="sm" p="md" mb="xl" radius="md">
          <Title order={3} className="heading">
            Bluetooth is currently not activated in your Browser
          </Title>
          <Text>See below how to activate this feature</Text>
        </Paper>
        <Grid align="stretch">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper shadow="sm" p="md" mb="xl" radius="md">
              <div className="cardHeader">
                <FontAwesomeIcon size="2x" icon={faChrome} />
                <div className="headerText">Chrome</div>
              </div>
              <Divider my="sm" />
              <Text>
                Web Bluetooth is part of the experimental features in Chrome.
                Learn{" "}
                <a
                  target="_blank"
                  href="https://support.google.com/chrome/answer/10612145?hl=en"
                  rel="noreferrer"
                >
                  here
                </a>{" "}
                how to activate them
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper shadow="sm" p="md" mb="xl" radius="md">
              <div className="cardHeader">
                <FontAwesomeIcon size="2x" icon={faEdge} />
                <div className="headerText">Edge</div>{" "}
              </div>
              <Divider my="sm" />
              <Text>
                You don't have to do anything. Web Bluetooth works out of the
                box
              </Text>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper shadow="sm" p="md" mb="xl" radius="md">
              <div className="cardHeader">
                <FontAwesomeIcon size="2x" icon={faGlobe} />
                <div className="headerText">Others</div>{" "}
              </div>
              <Divider my="sm" />
              <Text>Other browsers currently do not support this feature</Text>
            </Paper>
          </Grid.Col>
        </Grid>
      </div>
    );
  }
}

export default BleNotActivated;
