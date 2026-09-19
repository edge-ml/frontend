import React from "react";
import { NumberInput } from "@mantine/core";

import Hyperparameter from "./Hyperparameter";

const NumberHyperparameter = (props) => {
  return (
    <Hyperparameter {...props}>
      <NumberInput
        style={{ width: "100%" }}
        value={props.value}
        step={props.step_size}
        min={props.number_min}
        max={props.number_max}
        onChange={(value) => {
          props.handleChange({
            parameter_name: props.parameter_name,
            state: value,
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
