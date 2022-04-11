import React, { useState } from 'react';
import {
  Row,
  Col,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';
import Select from 'react-select';
import { platforms } from './platforms';
import { Line } from './components/Line';

export const ExportDetailView = ({
  model, // { name: string } // later platforms

  onClickViewModelDetails,
  onClickDownloadModel,
  platformName,
  platformContents,
  onPlatform
}) => {
  const nPlatforms = model.platforms
    .map(v => platforms.find(p => p.value === v))
    .filter(v => v);
  const nPlatform = nPlatforms.find(p => p.value === platformName);
  const Code = nPlatform.prism;

  return (
    <Row>
      <Col>
        <Line>
          <Button onClick={onClickViewModelDetails} className="float-right">
            See Model Details
          </Button>
          <b>Model name: </b>
          <span>{model.name}</span>
        </Line>
        <Line>
          <b>Model id: </b>
          <code>{model.id}</code>
        </Line>
        <Line>
          <b>Available on platforms: </b>
          <ul className="my-0">
            {nPlatforms.map(p => (
              <li key={p.value}>
                <span>{p.label}</span>
              </li>
            ))}
          </ul>
        </Line>

        <hr />

        <Line>
          <h5>Export model</h5>
        </Line>
        <Line>
          <div className="float-right d-flex">
            <span style={{ minWidth: '200px' }}>
              <Select
                value={nPlatform}
                onChange={x => onPlatform(x.value)}
                options={platforms}
              />
            </span>
            <Button onClick={onClickDownloadModel} className="ml-3">
              Download model
            </Button>
          </div>
          <b>Platform: </b>
        </Line>
        <Line>
          <b>Code: </b>
          <Code code={platformContents} />
        </Line>
      </Col>
    </Row>
  );
};
