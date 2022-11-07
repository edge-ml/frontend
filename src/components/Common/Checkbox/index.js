import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import './Checkbox.css';

const Checkbox = (props) => {
  const size = props.size || '20px';
  var onClick = props.onClick;
  if (!props.onClick) {
    onClick = () => {};
  }
  return (
    <label
      style={{ width: size, height: size, fontSize: size }}
      className="checkBoxContainer"
    >
      <input
        onClick={(e) => onClick(e)}
        type="checkbox"
        checked={props.isSelected}
      ></input>
      <span className="checkBoxCheckmark" style={{ width: size, height: size }}>
        <FontAwesomeIcon
          style={{ width: size, height: size }}
          className="checkBoxIcon"
          icon={faCheck}
        ></FontAwesomeIcon>
      </span>
    </label>
  );
};

export default Checkbox;
