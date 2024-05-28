import React from 'react';
import { Card, CardHeader, CardBody, Container } from 'reactstrap';

export const ValidationView = ({ ongoing, trained }) => {
  return (
    <Container>
      {ongoing ? (
        <div className="pt-3">
          <Card className="text-left">
            <CardHeader>
              <h4>Ongoing Trainings</h4>
            </CardHeader>
            <CardBody>{ongoing}</CardBody>
          </Card>
        </div>
      ) : null}
      {trained}
    </Container>
  );
};
