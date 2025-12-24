import React from "react";

import { Container, Grid } from "@mantine/core";

import Loader from "../../modules/loader";

import NumberHyperparameter from "../../components/Hyperparameters/NumberHyperparameter";
import SelectionHyperparameter from "../../components/Hyperparameters/SelectionHyperparameter";

export const HyperparameterView = ({
  model,
  hyperparameters,
  handleHyperparameterChange,
  isAdvanced,
}) => {
  return (
    <Loader loading={!model}>
      <Container fluid>
        <Grid>
          {model &&
            Object.keys(model.hyperparameters)
              .filter((h) => model.hyperparameters[h].is_advanced == isAdvanced)
              .map((h) => {
                if (model.hyperparameters[h].parameter_type === "number") {
                  return (
                    <Grid.Col span={{ base: 12, md: 4 }} pl={0}>
                      <NumberHyperparameter
                        {...model.hyperparameters[h]}
                        id={"input_" + model.hyperparameters[h].parameter_name}
                        handleChange={handleHyperparameterChange}
                        value={
                          hyperparameters.find(
                            (e) =>
                              e.parameter_name ===
                              model.hyperparameters[h].parameter_name
                          ).state
                        }
                      />
                    </Grid.Col>
                  );
                } else if (
                  model.hyperparameters[h].parameter_type === "selection"
                ) {
                  return (
                    <Grid.Col span={{ base: 12, md: 4 }} pl={0}>
                      <SelectionHyperparameter
                        {...model.hyperparameters[h]}
                        id={"input_" + model.hyperparameters[h].parameter_name}
                        handleChange={handleHyperparameterChange}
                        value={
                          hyperparameters.find(
                            (e) =>
                              e.parameter_name ===
                              model.hyperparameters[h].parameter_name
                          ).state
                        }
                      />
                    </Grid.Col>
                  );
                }
              })}
        </Grid>
      </Container>
    </Loader>
  );
};
