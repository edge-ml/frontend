import React, { Component } from 'react';
import { Collapse, Button } from 'reactstrap';

class ListItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCollapsed: true,
    };
    this.toggleCollapsed = this.toggleCollapsed.bind(this);
  }

  toggleCollapsed = () => {
    this.setState({ isCollapsed: !this.state.isCollapsed });
  };

  render() {
    return (
      <div key={this.props.value.name}>
        <ul className="list-group">
          <li className="list-group-item mb-2">
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="font-weight-bold">{this.props.value.name}</h6>
                <p>{this.props.value.description}</p>
              </div>
              <Button color="primary" onClick={this.toggleCollapsed}>
                {this.state.isCollapsed ? 'Expand' : 'Collapse'}
              </Button>
            </div>
          </li>
        </ul>
        {<Collapse isOpen={!this.state.isCollapsed}>Test</Collapse>}
      </div>
    );
  }
}
export default ListItem;
