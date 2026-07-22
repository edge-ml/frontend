import React from "react";
import { TextInput } from "@mantine/core";

import Hyperparameter from "./Hyperparameter";

const TextHyperparameter = (props) => {
  return (
    <Hyperparameter {...props}>
      <TextInput
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
