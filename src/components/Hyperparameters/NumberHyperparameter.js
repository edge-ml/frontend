import React, { Component } from 'react';
import { InputGroupAddon, Input } from 'reactstrap';

import Hyperparameter from './Hyperparameter';

const NumberHyperparameter = (props) => {
  return (
    <Hyperparameter {...props}>
      <InputGroupAddon className="w-100" addonType="append">
        <Input
          type="number"
          value={props.value}
          defaultValue={props.default}
          step={props.step_size}
          min={props.number_min}
          max={props.number_max}
          onChange={(e) => {
            props.handleChange({
              parameter_name: props.parameter_name,
              state: parseInt(e.target.value, 10),
            });
          }}
          className={`hyperparameter-input-container w-100 text-center 
              ${
                props.value === null ||
                (props.number_min <= props.value &&
                  props.number_max >= props.value)
                  ? ''
                  : 'border border-danger'
              }`}
        />
      </InputGroupAddon>
    </Hyperparameter>
  );
};

export default NumberHyperparameter;
