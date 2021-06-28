import React, { Component } from 'react';

import { deleteUser } from '../../services/ApiServices/AuthentificationServices';

class UserSettingsProvider extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.onDeleteUser = this.onDeleteUser.bind(this);
  }

  onDeleteUser(confirmationMail) {
    if (window.confirm('Are you sure to delete your user?')) {
      deleteUser(confirmationMail).then(() => {
        this.props.onLogout();
      });
    }
  }

  render() {
    return (
      <section>
        {React.cloneElement(this.props.children, {
          ...this.props,
          deleteUser: this.onDeleteUser
        })}
      </section>
    );
  }
}

export default UserSettingsProvider;
