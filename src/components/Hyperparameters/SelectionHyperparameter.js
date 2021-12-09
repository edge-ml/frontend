import React, { Component } from 'react';
import Select from 'react-select';
import {
  Button,
  Card,
  CardBody,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input,
  Label
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUnlock } from '@fortawesome/free-solid-svg-icons';

class SelectionHyperparameter extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.selectedOptions = {
      value: this.props.default,
      label: this.props.default
    };
  }

  handleChange = selectedOptions => {
    this.setState({ selectedOptions });
  };

  render() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: '10px'
        }}
      >
        <Label
          style={{ alignSelf: 'center', marginBottom: 0 }}
          title={this.props.description}
        >
          {this.props.display_name}
        </Label>
        <Select
          options={this.props.options.map(e => {
            return { value: e, label: e };
          })}
          isMulti={this.props.multi_select}
          value={this.state.selectedOptions}
          onChange={this.handleChange}
        />
      </div>
    );
  }
}
export default SelectionHyperparameter;
