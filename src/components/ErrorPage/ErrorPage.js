import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';

class ErrorPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Col style={{ textAlign: 'center', paddingTop: '100px' }}>
        <Row className="justify-content-md-center">
          <h1 style={{ fontSize: '70px' }}>{this.props.match.params.error}</h1>
        </Row>
        {this.props.match.params.errorText ? (
          <Row className="justify-content-md-center">
            <h2>{this.props.match.params.errorText}</h2>
          </Row>
        ) : null}
        <Row
          className="justify-content-md-center"
          style={{ textAlign: 'center', paddingTop: '30px' }}
        >
          <h5>
            The page you are looking for doesn't exist or an other error
            occured.
          </h5>
        </Row>
        <Row
          className="justify-content-md-center"
          style={{ textAlign: 'center', paddingTop: '30px' }}
        >
          If you want to try again click{' '}
          <a href="/" style={{ whiteSpace: 'pre-wrap' }}>
            {' '}
            here
          </a>
          .
        </Row>
      </Col>
    );
  }
}

export default ErrorPage;
