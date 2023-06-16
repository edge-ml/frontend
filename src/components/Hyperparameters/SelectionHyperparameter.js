import React, { Component } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import Hyperparameter from './Hyperparameter';

const SelectionHyperparameter = (props) => {
  console.log(props.value);
  return (
    <Hyperparameter {...props}>
      <Select
        options={props.options.map((e) => {
          return { value: e, label: e };
        })}
        isMulti={props.multi_select}
        value={props.value}
        defaultValue={props.value}
        onChange={(e) => {
          props.handleChange({
            parameter_name: props.parameter_name,
            state: e,
          });
        }}
        components={makeAnimated()}
        closeMenuOnSelect={!props.multi_select}
        isSearchable={false}
        className={
          props.multi_select
            ? 'hyperparameter-input-container-multi'
            : 'hyperparameter-input-container'
        }
        classNamePrefix="hyperparameter-input"
      />
    </Hyperparameter>
  );
};

export default SelectionHyperparameter;
