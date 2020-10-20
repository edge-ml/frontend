import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';

class ErrorPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      statusText: '',
      errorText: ''
    };
  }

  componentDidMount() {
    this.setState({
      error: this.props.match.params.error,
      statusText: this.props.match.params.statusText,
      errorText: this.props.match.params.errorText
    });
  }

  render() {
    return (
      <Col style={{ textAlign: 'center', paddingTop: '100px' }}>
        <Row className="justify-content-md-center">
          <h1 style={{ fontSize: '70px' }}>{this.state.error} Error</h1>
        </Row>
        <Row className="justify-content-md-center">
          <h2>{this.state.errorText}</h2>
        </Row>
        <Row
          className="justify-content-md-center"
          style={{ textAlign: 'center', paddingTop: '30px' }}
        >
          <h5>
            The page you are looking for doesn't exist or an other error
            occured.
          </h5>
        </Row>
      </Col>
    );
  }
}

export default ErrorPage;
