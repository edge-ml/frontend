import React, { useContext } from 'react';
import {
  Container,
  FormGroup,
  InputGroup,
  InputGroupText,
  Input,
  Button,
  Label
} from 'reactstrap';
import useDeviceApi from '../../Hooks/useDeviceAPI';
import useProjectStore from '../../stores/projectStore';

const GenerateCode = (props) => {
  const { currentProject } = useProjectStore();
  const { toggleDevieApi, generateApiKeys, removeApiKeys, readKey, writeKey } = useDeviceApi();


  const backendUrl = window.location.host;

  return (
    <Container>
      <div style={{ paddingTop: '16px', display: 'flex' }}>
        {currentProject.users ? (
          <FormGroup switch>
            <Label check>Device API</Label>
            <Input
              checked={currentProject.enableDeviceApi}
              onChange={(e) => toggleDevieApi(e.target.checked)}
              type="switch" role="switch" />
          </FormGroup>
        ) : null}
      </div>
      {currentProject.enableDeviceApi || currentProject.users ? (
        <div>
          <InputGroup>
            <InputGroupText>{'Backend-URL'}</InputGroupText>
            <Input disabled value={backendUrl} readOnly />
          </InputGroup>
          <InputGroup>
            <InputGroupText>{'Read Key'}</InputGroupText>
            <Input
              value={readKey ? readKey : 'Device-API is disabled for your user'}
              readOnly
            />
          </InputGroup>
          <InputGroup>
            <InputGroupText>{'Write Key'}</InputGroupText>
            <Input
              value={
                writeKey ? writeKey : 'Device-API is disabled for your user'
              }
              readOnly
            />
          </InputGroup>
          <div>
            <Button
              outline
              className="my-1"
              disabled={!currentProject.enableDeviceApi}
              color="primary"
              onClick={generateApiKeys}
            >
              {props.state ? 'Change key' : 'Generate key'}
            </Button>
            <Button
              outline
              className="mx-2 my-1"
              color="danger"
              disabled={!currentProject.enableDeviceApi || !readKey || !writeKey}
              onClick={removeApiKeys}
            >
              Remove key
            </Button>
          </div>
        </div>
      ) : (
        <h6>Feature disabled by project admin</h6>
      )}
    </Container>
  );
};

export default GenerateCode;
