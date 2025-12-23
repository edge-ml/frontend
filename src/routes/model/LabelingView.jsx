import React from "react";
import { Form, Badge, FormGroup, Card, CardBody, CardHeader } from "reactstrap";

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
    <Card className="text-left">
      <CardHeader>
        <h4>Target Labeling</h4>
      </CardHeader>
      <CardBody className="d-flex flex-column justify-content-between align-items-start">
        <Loader loading={!labelings && !labels}>
          <fieldset>
            {labelings && labelings.length
              ? labelings.map((x) => {
                  return (
                    <div className="d-flex flex-row align-items-center mt-2">
                      <div className="d-flex flex-row align-items-center align-self-baseline">
                        <input
                          id={x.id}
                          type="radio"
                          style={{ marginTop: "0.1em" }}
                          onClick={(y) => changeSelectedLabeling(x.id)}
                          checked={selectedLabeling === x.id}
                        ></input>
                        <label
                          className="mb-0 ms-1 me-1"
                          htmlFor={x.id}
                          onClick={(y) => changeSelectedLabeling(x.id)}
                        >
                          {x.name}
                        </label>
                      </div>
                      <div className="d-flex flex-wrap flex-row align-items-center align-content-start mt-0">
                        {x.labels.map((labelId) => {
                          const label = labels.find(
                            (label) => label.id === labelId
                          );
                          return (
                            <Badge
                              key={labelId}
                              className="m-1"
                              style={{ backgroundColor: label.color }}
                            >
                              {label.name}
                              <input
                                type="checkbox"
                                disabled={selectedLabeling !== x.id}
                                className="ms-1 float-right"
                                checked={selectedLabelsFor[x.id][labelId]}
                                onClick={(y) =>
                                  changeLabelSelection(x.id, labelId)
                                }
                              />
                            </Badge>
                          );
                        })}
                        <Badge className="m-1">
                          <Form inline>
                            <FormGroup>
                              <input
                                type="text"
                                value={unlabelledNameFor[x.id]}
                                onChange={(e) =>
                                  changeUnlabelledName(e.target.value, x.id)
                                }
                                disabled={selectedLabeling !== x.id}
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
                            </FormGroup>
                            <FormGroup>
                              <input
                                type="checkbox"
                                disabled={selectedLabeling !== x.id}
                                className="float-left"
                                checked={useUnlabelledFor[x.id]}
                                onClick={(e) =>
                                  changeUnlabelledFor(e.target.checked, x.id)
                                }
                              />
                            </FormGroup>
                          </Form>
                        </Badge>
                      </div>
                    </div>
                  );
                })
              : "There are no labelings defined"}
          </fieldset>
        </Loader>
        <small className="mt-3 text-left">
          <b>
            <i>Note:</i>
          </b>{" "}
          Model will classify based on target labeling.
          <br />
          Check "Other" to mark unlabeled data and use it in training.
          <br />
          Click and type into the "Other" field to rename the label.
        </small>
      </CardBody>
    </Card>
  );
};
