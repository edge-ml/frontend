import React, { Component } from 'react';
import {
  Container,
  Col,
  Row,
  Table,
  Input,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';

class ErrorPage extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    /*return (
                  <div>
                    <Row
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "35%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <Col>
                        <h1 style={{ fontSize: "70px" }}>
                          {this.props.error.status} Error
                        </h1>
                      </Col>
                    </Row>
                    <Row
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "45%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                        <Col>
                            <h2>{this.props.error.errorText}</h2>
                        </Col>
                    </Row>
                    <Row
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                        <Col>
                            <h5>The page you are looking for doesn't exist or an other error occured.</h5>
                        </Col>
                    </Row>
                  </div>
                );*/
    return (
      <Col style={{ textAlign: 'center', paddingTop: '100px' }}>
        <Row className="justify-content-md-center">
          <h1 style={{ fontSize: '70px' }}>{this.props.error.status} Error</h1>
        </Row>
        <Row className="justify-content-md-center">
          <h2>{this.props.error.errorText}</h2>
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
