import React, { Component } from 'react';
import { InputGroupAddon, Input } from 'reactstrap';

import Hyperparameter from './Hyperparameter';

class NumberHyperparameter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Hyperparameter {...this.props}>
        <InputGroupAddon className="w-100" addonType="append">
          <Input
            type="number"
            value={this.props.value}
            defaultValue={this.props.default}
            step={this.props.step_size}
            min={this.props.number_min}
            max={this.props.number_max}
            onChange={(e) => {
              this.props.handleChange({
                parameter_name: this.props.parameter_name,
                state: parseInt(e.target.value, 10),
              });
            }}
            className={`hyperparameter-input-container w-100 text-center 
              ${
                this.props.value === null ||
                (this.props.number_min <= this.props.value &&
                  this.props.number_max >= this.props.value)
                  ? ''
                  : 'border border-danger'
              }`}
          />
        </InputGroupAddon>
      </Hyperparameter>
    );
  }
}
export default NumberHyperparameter;
