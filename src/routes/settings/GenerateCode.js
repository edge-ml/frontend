import React, { Component } from 'react';
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
import { API_URI } from './../../services/ApiServices/ApiConstants';
import CodeSnippetModal from '../../components/ApiSnippetsModal/CodeSnippetModal';

class GenerateCode extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
    };
    this.toggleCodeSnippetModal = this.toggleCodeSnippetModal.bind(this);
  }

  toggleCodeSnippetModal(open) {
    this.setState({ modalOpen: !this.state.modalOpen });
    let newPath;
    if (!open) {
      newPath = '.';
    } else {
      newPath = this.props.location.pathname.replace(
        new RegExp('settings/?'),
        'settings/getCode'
      );
    }
    this.props.history.push(newPath);
  }

  render() {
    const backendUrl =
      API_URI.replace('/api/', '') === ''
        ? window.location.origin
        : API_URI.replace('/api/', '');
    return (
      <Container>
        <div style={{ paddingTop: '16px', display: 'flex' }}>
          <div>Device-API</div>
          {this.props.project.users ? (
            <FormGroup style={{ margin: 0 }}>
              <CustomInput
                className="ml-2"
                inline
                type="switch"
                id="exampleCustomSwitch"
                checked={this.props.project.enableDeviceApi}
                onChange={(e) => this.props.onDeviceApiSwitch(e.target.checked)}
              />
            </FormGroup>
          ) : null}
        </div>
        {this.props.project.enableDeviceApi || this.props.project.users ? (
          <div>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>{'Backend-URL'}</InputGroupText>
              </InputGroupAddon>
              <Input value={backendUrl} readOnly />
            </InputGroup>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>{'Key'}</InputGroupText>
              </InputGroupAddon>
              <Input
                value={
                  this.props.deviceKey
                    ? this.props.deviceKey
                    : 'Device-API is disabled for your user'
                }
                readOnly
              />
            </InputGroup>
            <div>
              <Button
                disabled={!this.props.project.enableDeviceApi}
                color="primary"
                onClick={this.props.onEnableDeviceApi}
              >
                {this.state.props ? 'Change key' : 'Generate key'}
              </Button>
              <Button
                className="mx-2"
                color="danger"
                disabled={!this.props.project.enableDeviceApi}
                onClick={this.props.onDisableDeviceApi}
              >
                Remove key
              </Button>
              <Button
                color="primary"
                disabled={
                  !this.props.project.enableDeviceApi || !this.props.deviceKey
                }
                onClick={() => this.toggleCodeSnippetModal(true)}
              >
                Get code
              </Button>
            </div>
          </div>
        ) : (
          <h6>Feature disabled by project admin</h6>
        )}
        {this.state.modalOpen && (
          <CodeSnippetModal
            isOpen={this.state.modalOpen}
            onCancel={() => this.toggleCodeSnippetModal(true)}
            backendUrl={backendUrl}
            deviceApiKey={this.props.deviceKey}
          ></CodeSnippetModal>
        )}
      </Container>
    );
  }
}
export default GenerateCode;
