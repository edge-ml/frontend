import React, { Component } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import Hyperparameter from './Hyperparameter';

class SelectionHyperparameter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Hyperparameter {...this.props}>
        <Select
          options={this.props.options.map((e) => {
            return { value: e, label: e };
          })}
          isMulti={this.props.multi_select}
          value={this.props.value}
          defaultValue={this.props.default}
          onChange={(e) => {
            this.props.handleChange({
              parameter_name: this.props.parameter_name,
              state: e,
            });
          }}
          components={makeAnimated()}
          closeMenuOnSelect={!this.props.multi_select}
          isSearchable={false}
          className={
            this.props.multi_select
              ? 'hyperparameter-input-container-multi'
              : 'hyperparameter-input-container'
          }
          classNamePrefix="hyperparameter-input"
        />
      </Hyperparameter>
    );
  }
}
export default SelectionHyperparameter;
