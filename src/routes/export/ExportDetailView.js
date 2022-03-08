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
  deployment, // { key: string, name: string, created_date: Time }

  onClickViewModelDetails,
  onClickDownloadModel,
  onChangeDeploymentName,
  onClickDelete,
  availablePlatforms,
  platform,
  onPlatform,
  publicLink
}) => {
  const nPlatforms = availablePlatforms
    .map(v => platforms.find(p => p.value === v))
    .filter(v => v);
  const nPlatform = nPlatforms.find(p => p.value === platform);
  const Code = nPlatform.prism;

  const [sample, setSample] = useState(nPlatform.samples[0]);

  const [newName, setNewName] = useState('');
  const handleNewNameChange = () => {
    onChangeDeploymentName(newName);
    setNewName('');
  };

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
          <b>Deployment name: </b>
          <span>{deployment.name}</span>
        </Line>
        <Line>
          <b>Deployment access key: </b>
          <code>{deployment.key}</code>
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
          <b>Public link: </b>
          <a href={publicLink}>{publicLink}</a>
        </Line>
        <Line>
          <div className="clearfix">
            <span className="float-right" style={{ minWidth: '300px' }}>
              <Select
                value={sample}
                onChange={x => setSample(x)}
                options={nPlatform.samples}
              />
            </span>
            <b>Usage samples: </b>
            <br />
            <span>
              You can change the model access method in the samples with the
              menu on the right.
            </span>
          </div>
          <Code code={sample.code({ link: publicLink })} />
        </Line>

        <hr />

        {/* <Line>
          <h5>Statistics</h5>
        </Line>

        <hr /> */}

        <Line>
          <h5>Administration</h5>
        </Line>
        <Line className="clearfix">
          <div className="float-right d-flex align-items-baseline">
            <InputGroup className="my-0">
              <Input
                placeholder="New name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
              />
            </InputGroup>
            <Button outline onClick={handleNewNameChange} className="ml-3">
              Change
            </Button>
          </div>
          <b>Change deployment name: </b>
        </Line>
        <Line>
          <Button
            outline
            color="danger"
            onClick={onClickDelete}
            className="float-right"
          >
            Delete deployment
          </Button>
          <b>Delete deployment: </b>
          <br />
          <span>This does not remove the underlying model.</span>
        </Line>
      </Col>
    </Row>
  );
};
