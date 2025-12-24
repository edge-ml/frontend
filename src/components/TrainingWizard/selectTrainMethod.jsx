import React from "react";
import {
  faGear,
  faGears,
  faSliders,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Fragment } from "react";
import { Box, Group, Text } from "@mantine/core";
import PlatformList from "../Common/PlatformList";

const TrainingMethod = (pipeline, onSelectTrainingMethod) => {
  let platforms = new Set(
    pipeline.steps
      .filter((elm) => ["PRE", "EVAL"].includes(elm.type))[0]
      .options.map((elm) => elm.platforms)
      .flat()
  );

  pipeline.steps.forEach((step) => {
    if (step.type === "PRE" || step.type === "CORE") {
      const plf = new Set(step.options.map((elm) => elm.platforms).flat());
      platforms = new Set([...platforms].filter((elm) => plf.has(elm)));
    }
  });
  return (
    <Box
      key={pipeline.name}
      className="edgeml-border cursor-pointer hover-bigger"
      p="sm"
      m="sm"
      onClick={() => onSelectTrainingMethod(pipeline)}
    >
      <Group justify="space-between" align="center">
        <Box>
          <Text fw={700}>{pipeline.name}</Text>
          <Text size="sm">{pipeline.description}</Text>
        </Box>
        <Group align="center">
          <PlatformList size="3rem" platforms={platforms} />
        </Group>
      </Group>
    </Box>
  );
};

const SelectTrainMethod = ({ pipelines, onSelectTrainingMethod }) => {
  return (
    <Fragment>
      {pipelines.map((elm) => TrainingMethod(elm, onSelectTrainingMethod))}
    </Fragment>
  );
};

SelectTrainMethod.validate = () => {
  return false;
};

export default SelectTrainMethod;
