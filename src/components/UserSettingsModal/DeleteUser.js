import React, { Component } from 'react';
import {
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';

class DeleteUser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmationMail: undefined
    };
    this.eMailChanged = this.eMailChanged.bind(this);
  }

  eMailChanged(e) {
    this.setState({
      confirmationMail: e.target.value
    });
  }

  render() {
    return (
      <div>
        <div>
          <h6>
            Please type <b>{this.props.userMail}</b> to confirm
          </h6>
          <div>All projects where you are admin will be deleted</div>
        </div>
        <InputGroup>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>E-Mail</InputGroupText>
          </InputGroupAddon>
          <Input
            type="text"
            id="E-Mail"
            placeholder="E-Mail"
            onChange={this.eMailChanged}
          />
        </InputGroup>
        <Button
          id="buttonLogoutUser"
          color="danger"
          className="m-1 mr-auto"
          disabled={this.state.confirmationMail !== this.props.userMail}
          onClick={() => this.props.deleteUser(this.state.confirmationMail)}
        >
          Delete user
        </Button>
      </div>
    );
  }
}

export default DeleteUser;
