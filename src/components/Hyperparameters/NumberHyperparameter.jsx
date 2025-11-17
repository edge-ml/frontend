import React, { Component } from "react";
import { InputGroupText, Input } from "reactstrap";

import Hyperparameter from "./Hyperparameter";

const NumberHyperparameter = (props) => {
  return (
    <Hyperparameter {...props}>
      <Input
        style={{ minHeight: "38px" }}
        type="number"
        value={props.value}
        defaultValue={props.value}
        step={props.step_size}
        min={props.number_min}
        max={props.number_max}
        onChange={(e) => {
          props.handleChange({
            parameter_name: props.parameter_name,
            state: e.target.value,
          });
        }}
        className={`hyperparameter-input-container text-center 
              ${
                props.value === null ||
                (props.number_min <= props.value &&
                  props.number_max >= props.value)
                  ? ""
                  : "border border-danger"
              }`}
      />
    </Hyperparameter>
  );
};

export default NumberHyperparameter;
