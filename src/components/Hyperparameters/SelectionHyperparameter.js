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
  UncontrolledTooltip
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

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
      <InputGroup style={{ display: 'flex' }}>
        <InputGroupAddon addonType="prepend">
          <InputGroupText style={{ width: '200px' }}>
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
        <InputGroupAddon addonType="append">
          <Select
            options={this.props.options.map(e => {
              return { value: e, label: e };
            })}
            isMulti={this.props.multi_select}
            value={this.state.selectedOptions}
            onChange={this.handleChange}
            components={makeAnimated()}
            closeMenuOnSelect={!this.props.multi_select}
            isSearchable={false}
            className={
              this.props.multi_select
                ? 'hyperparameter-input-container-multi'
                : 'hyperparameter-input-container'
            }
          />
        </InputGroupAddon>
      </InputGroup>
    );
  }
}
export default SelectionHyperparameter;
