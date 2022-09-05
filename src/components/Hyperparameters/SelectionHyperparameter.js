import React, { Component } from 'react';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import {
  Button,
  Card,
  CardBody,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input,
  Label,
  UncontrolledTooltip,
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

class SelectionHyperparameter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <InputGroup style={{ display: 'flex' }}>
        <InputGroupAddon addonType="prepend">
          <InputGroupText style={{ width: '225px' }}>
            {
              <React.Fragment>
                <FontAwesomeIcon
                  id={'hyperparameter' + this.props.id}
                  style={{ color: '#8b8d8f' }}
                  icon={faInfoCircle}
                  className="mr-2 fa-s"
                />
                <UncontrolledTooltip
                  placement="top-start"
                  target={'hyperparameter' + this.props.id}
                >
                  <b>Description:</b> {this.props.description}
                </UncontrolledTooltip>
              </React.Fragment>
            }
            {this.props.display_name}
          </InputGroupText>
        </InputGroupAddon>
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
      </InputGroup>
    );
  }
}
export default SelectionHyperparameter;
