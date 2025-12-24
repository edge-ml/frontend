import React, { useState } from "react";
import { Container, Grid, Select, Text } from "@mantine/core";
import NumberHyperparameter from "../../Hyperparameters/NumberHyperparameter";
import SelectionHyperparameter from "../../Hyperparameters/SelectionHyperparameter";

const SelectEvaluation = ({
  evaluation,
  onEvaluationChanged,
  setSelectedEval,
  footer,
}) => {
  const [selectedEvaluation, setSelectedEvaluation] = useState(0);

  // useEffect(() => {
  //   const data = {
  //     name: evaluation[selectedEvaluation].name,
  //     parameters: evaluation[selectedEvaluation].parameters,
  //   };
  // }, [selectedEvaluation]);

  const handleHyperparameterChange = ({ parameter_name, state }) => {
    const newEval = [...evaluation];
    const idx = newEval[selectedEvaluation].parameters.findIndex(
      (elm) => elm.parameter_name == parameter_name
    );
    newEval[selectedEvaluation].parameters[idx].value = state;
    onEvaluationChanged(newEval);
    setSelectedEval(newEval[selectedEvaluation]);
  };

  if (evaluation.length === 0) {
    return;
  }

  return (
    <>
      <Text fw={700} size="lg">
        7. Select Evaluation Strategy
      </Text>
      <Select
        data={evaluation.map((evl) => evl.name)}
        value={evaluation[selectedEvaluation]?.name ?? null}
        onChange={(value) => {
          const nextIdx = evaluation.findIndex((evl) => evl.name === value);
          if (nextIdx === -1) return;
          setSelectedEvaluation(nextIdx);
        }}
        mt="sm"
        size="lg"
      />
      {evaluation[0] ? (
        <HyperparameterView
          handleHyperparameterChange={handleHyperparameterChange}
          hyperparameters={evaluation[selectedEvaluation].parameters}
        />
      ) : null}
    </>
  );
};

export const HyperparameterView = ({
  handleHyperparameterChange,
  hyperparameters,
}) => {
  return (
    <Container fluid>
      <Grid>
        {hyperparameters.length > 0 &&
          hyperparameters.map((h) => {
            if (h.parameter_type === "number") {
              return (
                <Grid.Col span={{ base: 12, md: 6 }} pl={0}>
                  <NumberHyperparameter
                    {...h}
                    id={"input_" + h.parameter_name}
                    handleChange={handleHyperparameterChange}
                    value={h.value}
                  />
                </Grid.Col>
              );
            } else if (h.parameter_type === "selection") {
              return (
                <Grid.Col span={{ base: 12, md: 6 }} pl={0}>
                  <SelectionHyperparameter
                    {...h}
                    id={"input_" + h.parameter_name}
                    handleChange={handleHyperparameterChange}
                    value={h.value}
                  />
                </Grid.Col>
              );
            }
          })}
      </Grid>
    </Container>
  );
};

SelectEvaluation.validate = () => {};

export default SelectEvaluation;
