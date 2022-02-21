import React from 'react';
import { Label, Input, FormGroup, Row, Col } from 'reactstrap';

const Checkbox = ({ checked, value, onChange, label }) => (
  <FormGroup className="mr-2" check>
    <Label check>
      <Input
        value={value}
        type="radio"
        checked={checked}
        onChange={e => onChange(e.target.value)}
      />
      {label}
    </Label>
  </FormGroup>
);

export const ExportDetailView = ({
  model,

  dSource,
  dSourceList,
  setDSource,

  platform,
  platformList,
  setPlatform
}) => {
  return (
    <div>
      <Row>
        <Col className="col-3">Platform:</Col>
        <Col>
          {platformList.map((ds, i) => (
            <Checkbox
              checked={i === platform}
              value={ds.name}
              label={ds.label}
              onChange={() => setPlatform(i)}
            />
          ))}
        </Col>
      </Row>
      <Row>
        <Col className="col-3">Data source:</Col>
        <Col>
          {dSourceList.map((ds, i) => (
            <Checkbox
              checked={i === dSource}
              value={ds.name}
              label={ds.label}
              onChange={() => setDSource(i)}
            />
          ))}
        </Col>
      </Row>
    </div>
  );
};
