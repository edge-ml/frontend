import React, { Component } from 'react';
import {
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input,
  UncontrolledTooltip
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

class NumberHyperparameter extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText style={{ width: '200px' }}>
            {
              <React.Fragment>
                <FontAwesomeIcon
                  id={'hyperparameter' + this.props.id}
                  style={{ color: '#8b8d8f' }}
                  icon={faInfoCircle}
                  className="mr-2 fa-s"
                />
                <UncontrolledTooltip
                  placement="top-start"
                  target={'hyperparameter' + this.props.id}
                >
                  <b>Description:</b> {this.props.description}
                </UncontrolledTooltip>
              </React.Fragment>
            }
            {this.props.display_name}
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupAddon>
          <Input
            type="number"
            defaultValue={this.props.default}
            step={this.props.step_size}
            min={this.props.number_min}
            max={this.props.number_max}
            className="hyperparameter-input-container"
          />
        </InputGroupAddon>
      </InputGroup>
    );
  }
}
export default NumberHyperparameter;
