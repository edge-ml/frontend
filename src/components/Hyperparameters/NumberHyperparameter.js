import React, { Component } from 'react';
import {
  Button,
  Card,
  CardBody,
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  Input,
  Label,
  FormGroup,
  UncontrolledTooltip
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

class NumberHyperparameter extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      // <FormGroup style={{
      //   display: 'flex',
      //   flexDirection: 'row',
      //   justifyContent: 'space-between',
      //   gap: '10px',
      //   alignSelf: 'stretch',
      //   width: '80%',
      //   marginBottom: '5px'
      // }}>
      //   <Label style={{flexBasis: '10rem', alignSelf: 'center', marginBottom: '0px'}}
      //     title={this.props.description}>{this.props.display_name}</Label>
      //     <Input style={{flexGrow: 1}}
      //       name="number"
      //       type="number"
      //       defaultValue={this.props.default}
      //       step={this.props.step_size}
      //     />
      // </FormGroup>
      <InputGroup>
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
          <Input
            type="number"
            defaultValue={this.props.default}
            step={this.props.step_size}
            style={{ width: '100px' }}
          ></Input>
        </InputGroupAddon>
      </InputGroup>
    );
  }
}
export default NumberHyperparameter;
