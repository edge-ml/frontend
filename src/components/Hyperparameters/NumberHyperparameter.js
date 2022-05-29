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
  }

  render() {
    return (
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText style={{ width: '225px' }}>
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
        <InputGroupAddon addonType="append">
          <Input
            type="number"
            value={this.props.value}
            defaultValue={this.props.default}
            step={this.props.step_size}
            min={this.props.number_min}
            max={this.props.number_max}
            onChange={e => {
              this.props.handleChange({
                parameter_name: this.props.parameter_name,
                state: parseInt(e.target.value, 10)
              });
            }}
            className={`hyperparameter-input-container text-center 
              ${
                this.props.value === null ||
                (this.props.number_min <= this.props.value &&
                  this.props.number_max >= this.props.value)
                  ? ''
                  : 'border border-danger'
              }`}
          />
        </InputGroupAddon>
      </InputGroup>
    );
  }
}
export default NumberHyperparameter;
