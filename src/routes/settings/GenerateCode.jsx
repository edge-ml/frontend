import React, { useState } from "react";
import {
  Container,
  FormGroup,
  InputGroup,
  InputGroupText,
  Input,
  Button,
  Label,
} from "reactstrap";
import useDeviceApi from "../../Hooks/useDeviceAPI";
import useProjectStore from "../../stores/projectStore";

const GenerateCode = (props) => {
  const { currentProject } = useProjectStore();
  const { toggleDevieApi, generateApiKeys, removeApiKeys, readKey, writeKey } =
    useDeviceApi();
  const [isToggling, setIsToggling] = useState(false);

  const backendUrl = window.location.host;
  const deviceApiEnabled = !!currentProject.enable_external_api;
  const handleToggleDeviceApi = async (e) => {
    e.preventDefault();
    if (isToggling) {
      return;
    }

    const nextState = !currentProject.enable_external_api;
    setIsToggling(true);
    try {
      await toggleDevieApi(nextState);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <Container>
      <div style={{ paddingTop: "16px", display: "flex" }}>
        {currentProject.users ? (
          <FormGroup switch>
            <Label check>Device API</Label>
            <Input
              checked={currentProject.enable_external_api}
              onChange={handleToggleDeviceApi}
              disabled={isToggling}
              type="switch"
              role="switch"
            />
          </FormGroup>
        ) : null}
      </div>
      {currentProject.enable_external_api || currentProject.users ? (
        <div>
          <InputGroup>
            <InputGroupText>{"Backend-URL"}</InputGroupText>
            <Input disabled value={backendUrl} readOnly />
          </InputGroup>
          <InputGroup>
            <InputGroupText>{"Read Key"}</InputGroupText>
            <Input
              disabled={!deviceApiEnabled}
              value={
                readKey
                  ? readKey
                  : deviceApiEnabled
                    ? "No read key available"
                    : "Device-API is disabled for your user"
              }
              readOnly
            />
          </InputGroup>
          <InputGroup>
            <InputGroupText>{"Write Key"}</InputGroupText>
            <Input
              disabled={!deviceApiEnabled}
              value={
                writeKey
                  ? writeKey
                  : deviceApiEnabled
                    ? "No write key available"
                    : "Device-API is disabled for your user"
              }
              readOnly
            />
          </InputGroup>
          <div>
            <Button
              outline
              className="my-1"
              disabled={!currentProject.enable_external_api}
              color="primary"
              onClick={generateApiKeys}
            >
              {props.state ? "Change key" : "Generate key"}
            </Button>
            <Button
              outline
              className="mx-2 my-1"
              color="danger"
              disabled={
                !currentProject.enable_external_api || !readKey || !writeKey
              }
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
