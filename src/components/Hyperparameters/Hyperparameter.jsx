import React from 'react';
import {
  InputGroup,
  InputGroupText,
  UncontrolledTooltip,
} from 'reactstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

const Hyperparameter = (props) => (
  <InputGroup className="w-100">
      <InputGroupText>
        <FontAwesomeIcon
          id={'hyperparameter' + props.parameter_name}
          style={{ color: '#8b8d8f' }}
          icon={faInfoCircle}
          className="me-2 fa-s"
        />
        <UncontrolledTooltip
          placement="top-start"
          target={'hyperparameter' + props.parameter_name}
        >
          <b>Description:</b> {props.description}
        </UncontrolledTooltip>
        <span className="text-truncate">{props.display_name}</span>
      </InputGroupText>
   {props.children}
  </InputGroup>
);

export default Hyperparameter;
