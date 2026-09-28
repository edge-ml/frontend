import React, { Component } from "react";

class ErrorPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div style={{ textAlign: "center", paddingTop: "100px" }}>
        <h1 style={{ fontSize: "70px" }}>{this.props.match.params.error}</h1>
        {this.props.match.params.errorText ? (
          <h2>{this.props.match.params.errorText}</h2>
        ) : null}
        <div style={{ textAlign: "center", paddingTop: "30px" }}>
          <h5>
            The page you are looking for doesn't exist or an other error
            occured.
          </h5>
        </div>
        <div style={{ textAlign: "center", paddingTop: "30px" }}>
          If you want to try again click{" "}
          <a href="/" style={{ whiteSpace: "pre-wrap" }}>
            {" "}
            here
          </a>
          .
        </div>
      </div>
    );
  }
}

export default ErrorPage;
