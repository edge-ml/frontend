import React from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";

import Hyperparameter from "./Hyperparameter";

const toOption = (v) => ({ value: v, label: v });

const SelectionHyperparameter = (props) => {
  // react-select works with {value, label} options, but the parameter value the
  // backend expects is a plain string (or an array of strings for multi-select),
  // not the {value, label} object. Convert in both directions so a selection
  // parameter (e.g. the WHAR Model architecture dropdown) serializes correctly.
  const selectValue = props.multi_select
    ? (Array.isArray(props.value) ? props.value : []).map(toOption)
    : props.value != null && props.value !== ""
      ? toOption(props.value)
      : null;

  return (
    <Hyperparameter {...props}>
      <Select
        options={props.options.map(toOption)}
        isMulti={props.multi_select}
        value={selectValue}
        onChange={(e) => {
          props.handleChange({
            parameter_name: props.parameter_name,
            state: props.multi_select
              ? (e || []).map((o) => o.value)
              : e
                ? e.value
                : null,
          });
        }}
        components={makeAnimated()}
        closeMenuOnSelect={!props.multi_select}
        isSearchable={false}
        className={
          props.multi_select
            ? "hyperparameter-input-container-multi"
            : "hyperparameter-input-container"
        }
        classNamePrefix="hyperparameter-input"
      />
    </Hyperparameter>
  );
};

export default SelectionHyperparameter;
