import React from 'react';
import { Container, Row, Col, Footer, Button } from 'reactstrap';

const SaveFooter = (props) => (
  <div className="footer">
    <Container>
      <Row>
        <Col className="text-right">
          <Button color="primary" onSave={props.onSave}>
            Save settings
          </Button>
        </Col>
      </Row>
    </Container>
  </div>
);

export default SaveFooter;
