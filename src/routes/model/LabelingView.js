import React from 'react';
import { Badge } from 'reactstrap';

export const LabelingView = ({
  labelings,
  selectedLabeling,
  labels,
  changeSelectedLabeling,
  useUnlabelledFor,
  changeUnlabelledFor
}) => {
  return (
    <div className="card h-100" style={{ border: '0px solid white' }}>
      <div className="card-body d-flex flex-column justify-content-between align-items-start">
        <h4>Target Labeling</h4>
        <fieldset>
          {labelings.length
            ? labelings.map(x => {
                return (
                  <div className="d-flex flex-row align-items-center mt-2">
                    <input
                      id={x._id}
                      type="radio"
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
                    {x.labels.map(labelId => {
                      const label = labels.find(label => label._id === labelId);
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
                    <Badge
                      key={x._id + 'other'}
                      className={'m-1'}
                      style={{
                        backgroundColor: useUnlabelledFor[x._id]
                          ? '#388e3c'
                          : '#f1110d'
                      }}
                    >
                      Other
                    </Badge>
                  </div>
                );
              })
            : 'There are no labelings defined'}
        </fieldset>
        <small className="mt-3 text-left">
          <b>
            <i>Note:</i>
          </b>{' '}
          Model will classify based on target labeling.
          <br />
          Check "Other" to mark unlabeled data and use it in training.
        </small>
      </div>
    </div>
  );
};
