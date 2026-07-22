import React from "react";
import { Badge, Card, Text } from "@mantine/core";

import Loader from "../../modules/loader";

export const LabelingView = ({
  labelings,
  selectedLabeling,
  labels,
  changeSelectedLabeling,
  useUnlabelledFor,
  changeUnlabelledFor,
  unlabelledNameFor,
  changeUnlabelledName,
  selectedLabelsFor,
  changeLabelSelection,
}) => {
  return (
    <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: "left" }}>
      <Card.Section>
        <Text fw={700} size="lg" p="md"><h4>Target Labeling</h4></Text>
      </Card.Section>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-start", padding: "1rem" }}>
        <Loader loading={!labelings && !labels}>
          <fieldset>
            {labelings && labelings.length
              ? labelings.map((x) => {
                  return (
                    <div key={x._id} style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: "0.5rem" }}>
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", alignSelf: "baseline" }}>
                        <input
                          id={x._id}
                          type="radio"
                          style={{ marginTop: "0.1em" }}
                          onClick={(y) => changeSelectedLabeling(x._id)}
                          checked={selectedLabeling === x._id}
                        />
                        <label
                          style={{ marginBottom: 0, marginLeft: "0.25rem", marginRight: "0.25rem" }}
                          htmlFor={x._id}
                          onClick={(y) => changeSelectedLabeling(x._id)}
                        >
                          {x.name}
                        </label>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", flexDirection: "row", alignItems: "center", alignContent: "flex-start", marginTop: 0 }}>
                        {x.labels.map((labelId) => {
                          const label = labels.find(
                            (label) => label._id === labelId
                          );
                          return (
                            <Badge
                              key={labelId}
                              style={{ margin: "0.25rem", backgroundColor: label.color }}
                            >
                              {label.name}
                              <input
                                type="checkbox"
                                disabled={selectedLabeling !== x._id}
                                style={{ marginLeft: "0.25rem", float: "right" }}
                                checked={selectedLabelsFor[x._id][labelId]}
                                onClick={(y) =>
                                  changeLabelSelection(x._id, labelId)
                                }
                              />
                            </Badge>
                          );
                        })}
                        <Badge style={{ margin: "0.25rem" }}>
                          <div style={{ display: "inline" }}>
                            <div style={{ display: "inline-block" }}>
                              <input
                                type="text"
                                value={unlabelledNameFor[x._id]}
                                onChange={(e) =>
                                  changeUnlabelledName(e.target.value, x._id)
                                }
                                disabled={selectedLabeling !== x._id}
                                style={{
                                  backgroundColor: "rgba(0,0,0,0)",
                                  border: "none",
                                  color: "white",
                                  outline: "none",
                                  verticalAlign: "baseline",
                                  display: "inline-block",
                                  fontWeight: 700,
                                  padding: 0,
                                  height: "12px",
                                  width: "37px",
                                }}
                              />
                            </div>
                            <div style={{ display: "inline-block" }}>
                              <input
                                type="checkbox"
                                disabled={selectedLabeling !== x._id}
                                style={{ float: "left" }}
                                checked={useUnlabelledFor[x._id]}
                                onClick={(e) =>
                                  changeUnlabelledFor(e.target.checked, x._id)
                                }
                              />
                            </div>
                          </div>
                        </Badge>
                      </div>
                    </div>
                  );
                })
              : "There are no labelings defined"}
          </fieldset>
        </Loader>
        <Text size="sm" c="dimmed" mt="md" style={{ textAlign: "left" }}>
          <b>
            <i>Note:</i>
          </b>{" "}
          Model will classify based on target labeling.
          <br />
          Check "Other" to mark unlabeled data and use it in training.
          <br />
          Click and type into the "Other" field to rename the label.
        </Text>
      </div>
    </Card>
  );
};
