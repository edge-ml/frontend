import React from 'react';
import { Table, Input, Card, Button } from 'reactstrap';

import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './Snackbar.css';

function Snackbar(props) {
  return (
    <Card
      className="snackbar"
      onClick={(e) => {
        props.closeSnackbar();
        // () => e.preventDefault(); // FIXME: what was this originally here for?
      }}
    >
      <div className="fontawesome-wrapper">
        <FontAwesomeIcon icon={faExclamationTriangle} color="#b71c1c">
          {' '}
        </FontAwesomeIcon>
      </div>
      <div className="snackbar-text">
        <div>{props.text}</div>
        <div className="snackbar-button">X</div>
      </div>
    </Card>
  );
}

Snackbar.defaultProps = {
  text: '',
  closeSnackbar: () => {},
};
export default Snackbar;
