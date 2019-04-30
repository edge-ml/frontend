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
  Input,
  FormGroup,
  Label
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
      currentIsAdmin: props.currentIsAdmin,
      user: props.user,
      isNewUser: props.isNewUser,
      onCloseModal: props.onCloseModal,
      inputVariables: {
        name: props.user ? props.user.username : '',
        newPassword: '',
        passwordConfirm: '',
        currentPassword: '',
        isAdmin: false
      },
      modalState: {
        isOpen: props.isOpen
      },
      onSave: props.onSave,
      onDeleteUser: props.onDeleteUser,
      onAddUser: props.onAddUser,
      onReset2FA: props.onReset2FA
    };

    this.onCloseModal = this.onCloseModal.bind(this);
    this.onNameChanged = this.onNameChanged.bind(this);
    this.onPasswordChanged = this.onPasswordChanged.bind(this);
    this.onPasswordConfirmChanged = this.onPasswordConfirmChanged.bind(this);
    this.onCurrentPasswordChanged = this.onCurrentPasswordChanged.bind(this);
    this.onAdminRightsChanged = this.onAdminRightsChanged.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onDeleteUser = this.onDeleteUser.bind(this);
    this.onReset2FA = this.onReset2FA.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState(state => ({
      currentIsAdmin: props.currentIsAdmin,
      user: props.user,
      isNewUser: props.isNewUser,
      onCloseModal: props.onCloseModal,
      modalState: {
        isOpen: props.isOpen
      },
      onSave: props.onSave,
      onDeleteUser: props.onDeleteUser,
      onAddUser: props.onAddUser,
      onReset2FA: props.onReset2FA,
      inputVariables: {
        name: props.user ? props.user.username : '',
        newPassword: state.inputVariables.newPassword,
        passwordConfirm: state.inputVariables.passwordConfirm,
        currentPassword: state.inputVariables.currentPassword,
        isAdmin: state.inputVariables.isAdmin
      }
    }));
  }

  onNameChanged(name) {
    let inputVariables = { ...this.state.inputVariables };
    inputVariables.name = name;
    this.setState({ inputVariables });
  }

  onPasswordChanged(password) {
    let inputVariables = { ...this.state.inputVariables };
    inputVariables.newPassword = password;
    this.setState({ inputVariables });
  }

  onPasswordConfirmChanged(passwordConfirm) {
    let inputVariables = { ...this.state.inputVariables };
    inputVariables.passwordConfirm = passwordConfirm;
    this.setState({ inputVariables });
  }

  onCurrentPasswordChanged(currentPassword) {
    let inputVariables = { ...this.state.inputVariables };
    inputVariables.currentPassword = currentPassword;
    this.setState({ inputVariables });
  }

  onAdminRightsChanged(isAdmin) {
    let inputVariables = { ...this.state.inputVariables };
    inputVariables.isAdmin = isAdmin;
    this.setState({ inputVariables });
  }

  onDeleteUser() {
    if (!this.state.inputVariables.currentPassword) {
      window.alert('Current password is required.');
      return;
    }

    if (window.confirm('Are you sure to delete this user?')) {
      this.state.onDeleteUser(
        this.state.user.username,
        this.state.inputVariables.currentPassword
      );
      this.onCloseModal();
    }
  }

  onReset2FA() {
    if (!this.state.inputVariables.currentPassword) {
      window.alert('Current password is required.');
      return;
    }

    if (window.confirm('Are you sure to reset 2FA for this user?')) {
      this.state.onReset2FA(
        this.state.user.username,
        this.state.inputVariables.currentPassword
      );
      this.onCloseModal();
    }
  }

  onCloseModal() {
    this.state.onCloseModal();
    this.setState({
      isNewUser: false,
      user: undefined,
      onCloseModal: undefined,
      modalState: {
        isOpen: false
      },
      inputVariables: {
        name: '',
        newPassword: '',
        passwordConfirm: '',
        currentPassword: '',
        isAdmin: false
      },
      onSave: undefined,
      onDeleteUser: undefined
    });
  }

  onSave() {
    if (
      this.state.inputVariables.newPassword !==
      this.state.inputVariables.passwordConfirm
    ) {
      window.alert('Passwords do not match.');
      return;
    }

    if (this.state.isNewUser) {
      this.state.onAddUser(
        this.state.inputVariables.name,
        this.state.inputVariables.newPassword,
        this.state.inputVariables.isAdmin
      );
    } else {
      if (!this.state.inputVariables.currentPassword) {
        window.alert('Current password is required.');
        return;
      }

      this.state.onSave(
        this.state.inputVariables.name,
        this.state.inputVariables.newPassword,
        this.state.inputVariables.currentPassword
      );
    }

    this.onCloseModal();
  }

  render() {
    return (
      <Modal isOpen={this.state.modalState.isOpen}>
        <ModalHeader>
          {this.state.isNewUser ? 'Add User' : 'Edit User'}
        </ModalHeader>
        <ModalBody>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Username'}</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder={'Username'}
              value={this.state.inputVariables.name}
              onChange={e => this.onNameChanged(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Password'}</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder={'Password'}
              type="password"
              value={this.state.inputVariables.newPassword}
              onChange={e => this.onPasswordChanged(e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Confirm Password'}</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder={'Confirm Password'}
              type="password"
              value={this.state.inputVariables.passwordConfirm}
              onChange={e => this.onPasswordConfirmChanged(e.target.value)}
            />
          </InputGroup>
          {!this.state.isNewUser ? (
            <div>
              <hr />
              <InputGroup>
                <InputGroupAddon addonType="prepend">
                  <InputGroupText>{'Current Password'}</InputGroupText>
                </InputGroupAddon>
                <Input
                  placeholder={'your current password'}
                  type="password"
                  value={this.state.inputVariables.currentPassword}
                  onChange={e => this.onCurrentPasswordChanged(e.target.value)}
                />
              </InputGroup>
              <hr />
              <Button
                color="danger"
                block
                className="m-0"
                outline
                onClick={this.onDeleteUser}
              >
                Delete
              </Button>
            </div>
          ) : (
            <div>
              <FormGroup check>
                <Label>
                  <Input
                    type="checkbox"
                    id="checkbox"
                    onChange={e => this.onAdminRightsChanged(e.target.checked)}
                  />{' '}
                  <span color="muted">Admin</span>
                </Label>
              </FormGroup>
            </div>
          )}

          {!this.state.isNewUser && this.state.currentIsAdmin ? (
            <Button
              color="secondary"
              block
              className="m-0 mt-1"
              outline
              onClick={this.onReset2FA}
            >
              Reset 2FA
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
