import React, { Component } from "react";
import { Button } from "@mantine/core";

class Logout extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <small>Click here to logout now.</small>
        <Button
          color="red"
          style={{ marginTop: "0.25rem" }}
          onClick={this.props.onLogout}
        >
          Logout
        </Button>
      </div>
    );
  }
}

export default Logout;
