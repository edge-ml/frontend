import React, { useContext } from 'react';
import {
  Container,
  FormGroup,
  CustomInput,
  InputGroup,
  InputGroupAddon,
  Input,
  Button,
  InputGroupText,
} from 'reactstrap';
import { ProjectContext } from '../../ProjectProvider';
import useDeviceApi from '../../Hooks/useDeviceAPI';

const GenerateCode = (props) => {
  const { currentProject } = useContext(ProjectContext);
  const { toggleDevieApi, generateApiKeys, readKey, writeKey } = useDeviceApi();

  return (
    <Container>
      <div style={{ paddingTop: '16px', display: 'flex' }}>
        <div>Device-API</div>
        {currentProject.users ? (
          <FormGroup style={{ margin: 0 }}>
            <CustomInput
              className="ml-2"
              inline
              type="switch"
              id="exampleCustomSwitch"
              checked={currentProject.enableDeviceApi}
              onChange={(e) => toggleDevieApi(e.target.checked)}
            />
          </FormGroup>
        ) : null}
      </div>
      {currentProject.enableDeviceApi || currentProject.users ? (
        <div>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Backend-URL'}</InputGroupText>
            </InputGroupAddon>
            <Input value={props.backendUrl} readOnly />
          </InputGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Read Key'}</InputGroupText>
            </InputGroupAddon>
            <Input
              value={readKey ? readKey : 'Device-API is disabled for your user'}
              readOnly
            />
          </InputGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Write Key'}</InputGroupText>
            </InputGroupAddon>
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
              disabled={!currentProject.enableDeviceApi}
              onClick={props.onDisableDeviceApi}
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
