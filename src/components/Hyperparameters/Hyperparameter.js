import React from 'react';
import {
  InputGroup,
  InputGroupText,
  InputGroupAddon,
  UncontrolledTooltip,
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const Hyperparameter = (props) => (
  <InputGroup className="position-relative w-100 d-flex">
    <InputGroupAddon className="w-50" addonType="prepend">
      <InputGroupText className="w-100">
        <FontAwesomeIcon
          id={'hyperparameter' + props.parameter_name}
          style={{ color: '#8b8d8f' }}
          icon={faInfoCircle}
          className="mr-2 fa-s"
        />
        <UncontrolledTooltip
          placement="top-start"
          target={'hyperparameter' + props.parameter_name}
        >
          <b>Description:</b> {props.description}
        </UncontrolledTooltip>
        <span className="text-truncate">{props.display_name}</span>
      </InputGroupText>
    </InputGroupAddon>
    <div className="w-50">{props.children}</div>
  </InputGroup>
);

export default Hyperparameter;
