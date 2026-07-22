import React from "react";
import { Tooltip } from "@mantine/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const Hyperparameter = (props) => (
  <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
    <Tooltip
      label={<><b>Description:</b> {props.description}</>}
      position="top-start"
    >
      <span>
        <FontAwesomeIcon
          id={"hyperparameter" + props.parameter_name}
          style={{ color: "#8b8d8f" }}
          icon={faInfoCircle}
          size="sm"
        />
      </span>
    </Tooltip>
    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{props.display_name}</span>
    {props.children}
  </div>
);

export default Hyperparameter;
