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
        isAdmin: props.user ? props.user.isAdmin : false
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
        isAdmin: props.user ? props.user.isAdmin : false
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
    if (!this.state.inputVariables.name) {
      window.alert('Username cannot be empty.');
      return;
    }

    if (
      this.state.inputVariables.newPassword !==
      this.state.inputVariables.passwordConfirm
    ) {
      window.alert('Passwords do not match.');
      return;
    }

    if (!this.state.inputVariables.currentPassword) {
      window.alert('Current password is required.');
      return;
    }

    if (this.state.isNewUser) {
      if (!this.state.inputVariables.newPassword) {
        window.alert('Password cannot be empty.');
        return;
      }

      this.state.onAddUser(
        this.state.inputVariables.name,
        this.state.inputVariables.newPassword,
        this.state.inputVariables.isAdmin,
        this.state.inputVariables.currentPassword
      );
    } else {
      this.state.onSave(
        this.state.user.username,
        this.state.inputVariables.name,
        this.state.inputVariables.newPassword,
        this.state.inputVariables.isAdmin,
        this.state.inputVariables.currentPassword
      );
    }

    this.onCloseModal();
  }

  render() {
    let username = this.state.user ? this.state.user.username : '';

    return (
      <Modal isOpen={this.state.modalState.isOpen}>
        <ModalHeader>
          {this.state.isNewUser ? 'Add User' : 'Edit User: ' + username}
        </ModalHeader>
        <ModalBody>
          <InputGroup className="m-0">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Username'}</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder={'Username'}
              value={this.state.inputVariables.name}
              onChange={e => this.onNameChanged(e.target.value)}
            />
          </InputGroup>

          {this.state.currentIsAdmin ? (
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <Input
                    addon
                    type="checkbox"
                    checked={this.state.inputVariables.isAdmin}
                    onChange={e => this.onAdminRightsChanged(e.target.checked)}
                  />
                </InputGroupText>
              </InputGroupAddon>
              <Input
                defaultValue="Admin Rights"
                className={
                  this.state.inputVariables.isAdmin
                    ? 'inputChecked'
                    : 'inputNotChecked'
                }
              />
            </InputGroup>
          ) : null}

          <hr />

          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'New Password'}</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder={'New Password'}
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

          <hr />
          <InputGroup className="m-0">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>{'Current Password'}</InputGroupText>
            </InputGroupAddon>
            <Input
              placeholder={'Enter your current password to verify'}
              type="password"
              value={this.state.inputVariables.currentPassword}
              onChange={e => this.onCurrentPasswordChanged(e.target.value)}
            />
          </InputGroup>

          {!this.state.isNewUser && this.state.currentIsAdmin ? (
            <div>
              <hr />
              <Button
                color="secondary"
                block
                className="m-0"
                outline
                onClick={this.onReset2FA}
              >
                Reset 2FA
              </Button>
            </div>
          ) : null}

          {!this.state.isNewUser ? (
            <div>
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
