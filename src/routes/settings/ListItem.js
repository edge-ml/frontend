import React, { Component } from 'react';
import { Button, Card, CardTitle, CardBody, CardSubtitle } from 'reactstrap';

class ListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Card className="my-2 p-1">
        <CardTitle className="text-left">
          <h5>{this.props.value.name}</h5>
        </CardTitle>
        <CardSubtitle className="text-left">
          {this.props.value.description}
        </CardSubtitle>
        <CardBody>{this.props.component}</CardBody>
      </Card>
    );
  }
}
export default ListItem;
