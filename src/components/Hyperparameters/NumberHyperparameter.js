import React, { Component } from 'react';
import {
  Button,
  Card,
  CardBody,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';

class NumberHyperparameter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      identifier: props.identifier,
      parameters: props.parameters,
      selectedValue: props.parameters.default
    };
  }

  render() {
    return (
      <div className="d-flex flex-column bg-warning">
        <i>{this.state.parameters.display_name}</i>
        <input
          id={'slider_' + this.state.identifier}
          type="range"
          min={this.state.parameters.number_min}
          max={this.state.parameters.number_max}
          value={this.state.selectedValue}
          onChange={e => {
            this.setState({ selectedValue: e.target.value });
          }}
        ></input>
        <label for={'slider_' + this.state.identifier}>
          Value: {this.state.selectedValue}
        </label>
        <div>{JSON.stringify(this.state.parameters)}</div>
      </div>
    );
  }
}
export default NumberHyperparameter;
