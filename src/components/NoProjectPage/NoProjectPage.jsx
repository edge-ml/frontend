import React, { Component } from "react";

class NoProjectPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "75%", padding: "3rem 0" }}>
        <h2>
          {this.props.text ? (
            this.props.text
          ) : (
            <div id="noProjectPageStandardText">
              Open or create a project on the left to get started!
            </div>
          )}
        </h2>
      </div>
    );
  }
}

export default NoProjectPage;
