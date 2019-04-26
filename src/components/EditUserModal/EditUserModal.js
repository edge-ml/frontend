import React, { Component } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input
} from 'reactstrap';

import {
  isValidColor,
  hexToForegroundColor,
  generateRandomColor
} from '../../services/ColorService';

import './EditUserModal.css';

class EditUserModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.user,
      isNewUser: props.isNewUser,
      inputVariables: {
        newPassword: '',
        currentPassword: ''
      },
      modalState: {
        isOpen: true
      }
    };
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      user: props.user,
      isNewUser: props.isNewUser
    }));
  }

  render() {
    return (
      <Modal isOpen={this.state.modalState.isOpen}>
        <ModalHeader>{'Edit User'}</ModalHeader>
        <ModalBody>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Username'}</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder={'Username'}
              value={this.state.user ? this.state.user.username : ''}
              onChange={e => this.onNameChanged(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Password'}</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder={'Password'}
              value={''}
              onChange={e => this.onPasswordChanged(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Confirm Password'}</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder={'Confirm Password'}
              value={''}
              onChange={e => this.onPasswordConfirmChanged(e.target.value)}
            />
          </InputGroup>
          <hr />
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Current Password'}</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder={'your current password'}
              value={''}
              onChange={e => this.onPasswordChanged(e.target.value)}
            />
          </InputGroup>

          <hr />
          {!this.state.isNewUser ? (
            <Button
              color="danger"
              block
              className="m-0"
              outline
              onClick={this.onDeleteUser}
            >
              Delete
            </Button>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="primary" className="m-1 mr-auto" onClick={this.onSave}>
            Save
          </Button>{' '}
          <Button color="secondary" className="m-1" onClick={this.onCloseModal}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}
export default EditUserModal;
