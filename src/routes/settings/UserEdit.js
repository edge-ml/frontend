import React, { Component } from 'react';
import { Button, Row, Col, Table } from 'reactstrap';

import AutoCompleteInput from '../../components/AutoCompleteInput/AutocompleteInput';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import { getUserNameSuggestions } from '../../services/ApiServices/AuthentificationServices';

class UserEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userSearchValue: '',
      userNames: this.props.project.users,
    };
    this.onAddUserName = this.onAddUserName.bind(this);
    this.onChangeUserNameSuggestion =
      this.onChangeUserNameSuggestion.bind(this);
    this.deleteUserName = this.deleteUserName.bind(this);
    this.usersValid = this.usersValid.bind(this);
  }

  onAddUserName(e) {
    e.preventDefault();
    this.setState({
      userNames: this.state.userNames.concat({ userName: e.target.value }),
      userSearchValue: '',
    });
  }

  onChangeUserNameSuggestion(e) {
    this.setState({
      userSearchValue: e.target.value,
    });
  }

  deleteUserName(userName) {
    this.setState({
      userNames: this.state.userNames.filter(
        (elm) => elm.userName !== userName
      ),
    });
  }

  usersValid(users) {
    return users.every(
      (elm) =>
        elm.userName !== this.props.userName &&
        elm.userName !== this.props.userMail
    );
  }

  render() {
    return this.props.project.users ? (
      <div>
        <h5 style={{ paddingTop: '16px' }}>Users</h5>
        <Row style={{ padding: '8px' }} className="user-search-heading">
          <Col className="col-2 font-weight-bold">Search users: </Col>
          <Col>
            <AutoCompleteInput
              type="text"
              name="User ID"
              value={this.state.userSearchValue}
              placeholder="Enter username"
              onClick={this.onAddUserName}
              onChange={this.onChangeUserNameSuggestion}
              getsuggestions={getUserNameSuggestions}
              filter={[
                ...this.props.project.users.map((elm) => elm.userName),
                this.props.userName,
              ]}
            ></AutoCompleteInput>
          </Col>
        </Row>
        <Table striped>
          <thead>
            <tr className="table-record">
              <th className="table-record-left">#</th>
              <th className="table-record-center">User</th>
              <th className="table-record-right">Delete</th>
            </tr>
          </thead>
          <tbody>
            {this.state.userNames.map((user, index) => {
              return (
                <tr className="table-record" key={user + index}>
                  <td className="table-record-left">{index + 1}</td>
                  <td className="table-record-center">{user.userName}</td>
                  <td className="datasets-column table-record-right">
                    <Button
                      className="button-delete-user"
                      color="danger"
                      size="sm"
                      onClick={() => this.deleteUserName(user.userName)}
                    >
                      <FontAwesomeIcon
                        className="mr-2"
                        icon={faTrash}
                      ></FontAwesomeIcon>
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ color: 'red', display: 'flex', alignItems: 'center' }}>
            {this.usersValid(this.state.userNames)
              ? this.props.error
                ? 'Could not add users. Make sure they exist'
                : null
              : `${this.props.userName} is already in the project`}
          </div>
        </div>
        <hr></hr>
        <div
          style={{
            display: 'flex',
            justifyContent: 'right',
          }}
        >
          <Button
            id="buttonSaveProject"
            color="primary"
            onClick={() => this.props.onSaveUserNames(this.state.userNames)}
            disabled={!this.usersValid(this.state.userNames)}
          >
            Save
          </Button>
        </div>
      </div>
    ) : null;
  }
}

export default UserEdit;
