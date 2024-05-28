import React, { Component } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import { Input } from 'reactstrap';

import Hyperparameter from './Hyperparameter';

const TextHyperparameter = (props) => {
  console.log(props.value);
  return (
    <Hyperparameter {...props}>
      <Input
        type="text"
        value={props.value}
        onChange={(e) => {
          props.handleChange({
            parameter_name: props.parameter_name,
            state: e.target.value,
          });
        }}
      />
    </Hyperparameter>
  );
};

export default TextHyperparameter;
