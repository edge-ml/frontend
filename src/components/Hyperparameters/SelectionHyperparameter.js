import React, { Component } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import Hyperparameter from './Hyperparameter';

const SelectionHyperparameter = (props) => {
  return (
    <Hyperparameter {...props}>
      <Select
        styles={{
          control: (provided) => ({
            ...provided,
            textAlign: 'center',
          }),
        }}
        options={props.options.map((e) => {
          return { value: e, label: e };
        })}
        menuPosition="fixed"
        isMulti={props.multi_select}
        value={props.value}
        defaultValue={props.value}
        onChange={(e) => {
          props.handleChange({
            parameter_name: props.parameter_name,
            state: e.value,
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
