import React from "react";
import { Button, Spinner } from "reactstrap";
import PropTypes from "prop-types";

function SpinnerButton({
  children,
  loading = false,
  loadingtext = "Loading...",
  spinnercolor = "white",
  ...props
}) {
  return (
    <Button {...props}>
      {loading ? (
        <div>
          {loadingtext}
          <Spinner
            style={{
              width: "1rem",
              height: "1rem",
              marginLeft: "4px",
            }}
            color={spinnercolor}
          />
        </div>
      ) : (
        children
      )}
    </Button>
  );
}

SpinnerButton.propTypes = {
  children: PropTypes.element.isRequired,
  loading: PropTypes.bool,
  loadingtext: PropTypes.string,
  spinnercolor: PropTypes.string,
};

export default SpinnerButton;
