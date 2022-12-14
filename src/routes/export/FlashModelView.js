import React from 'react';
import { Row, Col, Button } from 'reactstrap';
import { Line } from './components/Line';

export const FlashModelView = ({ onClickFlashModel }) => {
  return (
    <Row>
      <Col>
        <Line>
          <Button onClick={onClickFlashModel} className="float-right">
            Flash model
          </Button>
          <div>
            You can automatically compile and flash the selected model to your
            device.
          </div>
        </Line>
      </Col>
    </Row>
  );
};
