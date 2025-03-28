import React, { Component } from "react";
import { Container } from "reactstrap";

class NoProjectPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Container className="d-flex align-items-center justify-content-center h-75 py-5">
        <h2>
          {this.props.text ? (
            this.props.text
          ) : (
            <div id="noProjectPageStandardText">
              Open or create a project on the left to get started!
            </div>
          )}
        </h2>
      </Container>
    );
  }
}

export default NoProjectPage;
