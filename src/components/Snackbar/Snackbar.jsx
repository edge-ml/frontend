import React from "react";
import { Card } from "@mantine/core";

import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./Snackbar.css";

function Snackbar({ text = "", closeSnackbar = () => {} }) {
  return (
    <Card
      className="snackbar"
      shadow="sm"
      padding="md"
      radius="md"
      withBorder
      onClick={(e) => {
        closeSnackbar();
        e.preventDefault();
      }}
    >
      <div className="fontawesome-wrapper">
        <FontAwesomeIcon icon={faExclamationTriangle} color="#b71c1c" />
      </div>
      <div className="snackbar-text">
        <div>{text}</div>
        <div className="snackbar-button">X</div>
      </div>
    </Card>
  );
}

export default Snackbar;
