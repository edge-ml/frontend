import React, { Component } from 'react';
import { Card, CardTitle, CardBody, CardSubtitle } from 'reactstrap';

class ListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="p-2 my-2">
        <div className="header-wrapper d-flex flex-column align-content-center">
          <h5>{name}</h5>
          <div>{description}</div>
        </div>
        <div className="body-wrapper p-3">{component}</div>
      </div>
    );
  }
}
export default ListItem;
