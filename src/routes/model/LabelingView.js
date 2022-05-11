import React from 'react';
import { Badge } from 'reactstrap';

import Loader from '../../modules/loader';

export const LabelingView = ({
  labelings,
  selectedLabeling,
  labels,
  changeSelectedLabeling,
  useUnlabelledFor,
  changeUnlabelledFor,
  unlabelledNameFor,
  changeUnlabelledName
}) => {
  return (
    <div className="card h-100" style={{ border: '0px solid white' }}>
      <div className="card-body d-flex flex-column justify-content-between align-items-start">
        <h4>Target Labeling</h4>
        <Loader loading={!labelings && !labels}>
          <fieldset>
            {labelings && labelings.length
              ? labelings.map(x => {
                  return (
                    <div className="d-flex flex-row align-items-center mt-2">
                      <div className="d-flex flex-row align-items-center align-self-baseline">
                        <input
                          id={x._id}
                          type="radio"
                          style={{ marginTop: '0.1em' }}
                          onClick={y => changeSelectedLabeling(x._id)}
                          checked={selectedLabeling === x._id}
                        ></input>
                        <label
                          className="mb-0 ml-1 mr-1"
                          for={x._id}
                          onClick={y => changeSelectedLabeling(x._id)}
                        >
                          {x.name}
                        </label>
                      </div>
                      <div className="d-flex flex-wrap flex-row align-items-center align-content-start mt-0">
                        {x.labels.map(labelId => {
                          const label = labels.find(
                            label => label._id === labelId
                          );
                          return (
                            <Badge
                              key={labelId}
                              className={'m-1'}
                              style={{ backgroundColor: label.color }}
                            >
                              {label.name}
                            </Badge>
                          );
                        })}
                        <input
                          type="checkbox"
                          className="mt-0 ml-2 mr-0"
                          checked={useUnlabelledFor[x._id]}
                          onClick={e => {
                            changeUnlabelledFor(e.target.checked, x._id);
                          }}
                        />
                        <input
                          type="text"
                          name="otherLabel"
                          id="otherLabel"
                          value={unlabelledNameFor[x._id]}
                          onChange={e =>
                            changeUnlabelledName(e.target.value, x._id)
                          }
                          style={{
                            backgroundColor: useUnlabelledFor[x._id]
                              ? '#388e3c'
                              : '#f1110d',
                            border: 'none',
                            color: 'white',
                            outline: 'none',
                            fontWeight: '700',
                            fontSize: '75%',
                            lineHeight: '1',
                            verticalAlign: 'baseline',
                            display: 'inline-block',
                            borderRadius: '0.25rem',
                            margin: '0.25rem',
                            paddingLeft: '0.25rem',
                            paddingRight: '0.25rem',
                            width: '41px',
                            fontFamily:
                              '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","Liberation Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"'
                          }}
                        />
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
