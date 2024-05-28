import React, { Component } from 'react';
import { Button } from 'reactstrap';

import { validateEmail } from './../../services/helpers';
import { changeUserMail } from './../../services/ApiServices/AuthentificationServices';

class Logout extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="d-flex flex-column align-items-start">
        <small>Click here to logout now.</small>
        <Button className="btn-danger mt-1" onClick={this.props.onLogout}>
          Logout
        </Button>
      </div>
    );
  }
}

export default Logout;
