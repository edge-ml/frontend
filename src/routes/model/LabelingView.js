import React from 'react';
import { Form, Badge, FormGroup } from 'reactstrap';

import Loader from '../../modules/loader';

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
    <div className="card h-100" style={{ border: '0px solid white' }}>
      <div className="card-body d-flex flex-column justify-content-between align-items-start">
        <h4>Target Labeling</h4>
        <Loader loading={!labelings && !labels}>
          <fieldset>
            {labelings && labelings.length
              ? labelings.map((x) => {
                  return (
                    <div className="d-flex flex-row align-items-center mt-2">
                      <div className="d-flex flex-row align-items-center align-self-baseline">
                        <input
                          id={x._id}
                          type="radio"
                          style={{ marginTop: '0.1em' }}
                          onClick={(y) => changeSelectedLabeling(x._id)}
                          checked={selectedLabeling === x._id}
                        ></input>
                        <label
                          className="mb-0 ml-1 mr-1"
                          for={x._id}
                          onClick={(y) => changeSelectedLabeling(x._id)}
                        >
                          {x.name}
                        </label>
                      </div>
                      <div className="d-flex flex-wrap flex-row align-items-center align-content-start mt-0">
                        {x.labels.map((labelId) => {
                          const label = labels.find(
                            (label) => label._id === labelId
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
                                disabled={selectedLabeling !== x._id}
                                className="ml-1 float-right"
                                checked={selectedLabelsFor[x._id][labelId]}
                                onClick={(y) =>
                                  changeLabelSelection(x._id, labelId)
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
                                value={unlabelledNameFor[x._id]}
                                onChange={(e) =>
                                  changeUnlabelledName(e.target.value, x._id)
                                }
                                disabled={selectedLabeling !== x._id}
                                style={{
                                  backgroundColor: 'rgba(0,0,0,0)',
                                  border: 'none',
                                  color: 'white',
                                  outline: 'none',
                                  verticalAlign: 'baseline',
                                  display: 'inline-block',
                                  fontWeight: 700,
                                  padding: 0,
                                  height: '12px',
                                  width: '37px',
                                }}
                              />
                            </FormGroup>
                            <FormGroup>
                              <input
                                type="checkbox"
                                disabled={selectedLabeling !== x._id}
                                className="float-left"
                                checked={useUnlabelledFor[x._id]}
                                onClick={(e) =>
                                  changeUnlabelledFor(e.target.checked, x._id)
                                }
                              />
                            </FormGroup>
                          </Form>
                        </Badge>
                      </div>
                    </div>
                  );
                })
              : 'There are no labelings defined'}
          </fieldset>
        </Loader>
        <small className="mt-3 text-left">
          <b>
            <i>Note:</i>
          </b>{' '}
          Model will classify based on target labeling.
          <br />
          Check "Other" to mark unlabeled data and use it in training.
          <br />
          Click and type into the "Other" field to rename the label.
        </small>
      </div>
    </div>
  );
};
