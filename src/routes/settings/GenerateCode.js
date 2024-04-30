import React, { useState, useEffect, useContext } from 'react';
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
import CodeSnippetModal from '../../components/ApiSnippetsModal/CodeSnippetModal';
import { ProjectContext } from '../../ProjectProvider';

const GenerateCode = (props) => {
  const { currentProject } = useContext(ProjectContext);

  const [modalOpen, setModalOpen] = useState(false);

  const toggleCodeSnippetModal = () => {
    let newPath;
    if (props.codeSnippetModalOpen && modalOpen) {
      newPath = '.';
    }
    setModalOpen(!modalOpen);
    props.history.push(newPath);
  };

  const onDeviceApiSwitch = () => {};

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
              onChange={(e) => onDeviceApiSwitch(e.target.checked)}
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
              value={
                props.readApiKey
                  ? props.readApiKey
                  : 'Device-API is disabled for your user'
              }
              readOnly
            />
          </InputGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Write Key'}</InputGroupText>
            </InputGroupAddon>
            <Input
              value={
                props.writeApiKey
                  ? props.writeApiKey
                  : 'Device-API is disabled for your user'
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
              onClick={props.onEnableDeviceApi}
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
            <Button
              outline
              className="my-1"
              color="primary"
              disabled={!currentProject.enableDeviceApi || !props.deviceKey}
              onClick={() => toggleCodeSnippetModal()}
            >
              Get code
            </Button>
          </div>
        </div>
      ) : (
        <h6>Feature disabled by project admin</h6>
      )}
      {modalOpen && (
        <CodeSnippetModal
          isOpen={modalOpen}
          onCancel={() => toggleCodeSnippetModal()}
          backendUrl={props.backendUrl}
          deviceApiKey={props.deviceKey}
        />
      )}
    </Container>
  );
};

export default GenerateCode;
