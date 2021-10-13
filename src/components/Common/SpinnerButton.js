import React from 'react';
import { Button, Spinner } from 'reactstrap';
import PropTypes from 'prop-types';

function SpinnerButton(props) {
  console.log(props);
  return (
    <Button {...props}>
      {props.loading ? (
        <div>
          {props.loadingText}
          <Spinner
            style={{
              width: '1rem',
              height: '1rem',
              marginLeft: '4px'
            }}
            color={props.spinnerColor}
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
  loadingText: 'Loading...',
  spinnerColor: 'white'
};
SpinnerButton.propTypes = {
  children: PropTypes.element.isRequired
};

export default SpinnerButton;
