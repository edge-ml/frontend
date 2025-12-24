import React from "react";
import { Group, Text, Tooltip } from "@mantine/core";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const Hyperparameter = (props) => (
  <Group align="center" wrap="nowrap" w="100%">
    <Tooltip
      label={
        <span>
          <b>Description:</b> {props.description}
        </span>
      }
      withArrow
    >
      <FontAwesomeIcon
        style={{ color: "#8b8d8f" }}
        icon={faInfoCircle}
      />
    </Tooltip>
    <Text lineClamp={1}>{props.display_name}</Text>
    {props.children}
  </Group>
);

export default Hyperparameter;
