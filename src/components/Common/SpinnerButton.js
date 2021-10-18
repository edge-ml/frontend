import React from 'react';
import { Button, Spinner } from 'reactstrap';
import PropTypes from 'prop-types';

function SpinnerButton(props) {
  return (
    <Button {...props}>
      {props.loading ? (
        <div>
          {props.loadingtext}
          <Spinner
            style={{
              width: '1rem',
              height: '1rem',
              marginLeft: '4px'
            }}
            color={props.spinnercolor}
          />
        </div>
      ) : (
        props.children
      )}
    </Button>
  );
}

SpinnerButton.defaultProps = {
  loading: false,
  loadingtext: 'Loading...',
  spinnercolor: 'white'
};
SpinnerButton.propTypes = {
  children: PropTypes.element.isRequired
};

export default SpinnerButton;
