import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleRight,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

import React, { Fragment, useState } from 'react';
import { Badge, Button } from 'reactstrap';

import { useHistory } from 'react-router-dom';
import classNames from 'classnames';

const displayTime = (time) => {
  const date = new Date(time);
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
};

const format_time = (s) => {
  const dtFormat = new Intl.DateTimeFormat('en-GB', {
    timeStyle: 'medium',
    timeZone: 'UTC',
  });

  return dtFormat.format(new Date(s));
};

const Labelings = (props) => {
  if (!props.dataset.labelings.length) {
    return null;
  }
  const labelings = props.dataset.labelings.map((elm) =>
    props.labelings.find((labeling) => labeling._id === elm.labelingId)
  );
  const labels = labelings.map((labeling) =>
    labeling.labels.map((elm) =>
      props.labels.find((label) => elm === label._id)
    )
  );

  return (
    <div className="mt-1">
      <b>Labelings: </b>
      {labelings.map((labeling, idx) => (
        <Badge className="mr-2 badgeSize badgeLabelings">
          <b>{labeling.name + ': '}</b>
          {labels[idx].map((label) => (
            <Badge
              className="badgeSize mx-1"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </Badge>
          ))}
        </Badge>
      ))}
    </div>
  );
};

const Metadata = (props) => {
  const dataset = props.dataset;
  return (
    <div className="mt-2">
      <div className="mt-2 d-inline font-weight-bold">Metadata: </div>
      <div className="d-inline">
        {Object.keys(dataset.metaData).map((key, idx) => {
          const value = dataset.metaData[key];
          return (
            <Badge className="mr-2 badgeSize" color="primary">
              <b>{key}: </b>
              {value}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

const AdditionalInfo = (props) => {
  const dataset = props.dataset;

  return (
    <div className="text-left">
      <Metadata dataset={dataset}></Metadata>
      <Labelings
        labelings={props.labelings}
        labels={props.labels}
        dataset={props.dataset}
      ></Labelings>
    </div>
  );
};

const DatasetTableEntry = (props) => {
  const dataset = props.dataset;
  const history = useHistory();

  const [isOpen, setOpen] = useState(false);

  const duration = Math.max(dataset.end - dataset.start, 0);

  return (
    <Fragment>
      <div
        className={classNames('card p-1 mt-2 p-2 datasetCard', {
          datasetCard_selected: props.isSelected,
        })}
        onClick={(e) => props.toggleCheck(e, dataset['_id'])}
      >
        <div className="d-flex align-items-center flex-row">
          <div
            className="p-2 align-self-stretch d-flex"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!isOpen);
            }}
          >
            <div
              className={classNames(
                'd-flex align-items-center animationDuration',
                {
                  collapse_arrow: isOpen,
                }
              )}
            >
              <FontAwesomeIcon
                style={{ fontSize: '2rem' }}
                icon={faAngleRight}
              ></FontAwesomeIcon>
            </div>
          </div>
          <div className="flex-grow-1 mx-2">
            <div className=" d-flex flex-row justify-content-between">
              <div className="text-left">
                <div className="font-weight-bold font-size-lg h5 d-inline">
                  {dataset.name}
                </div>
                {duration != 0 ? (
                  <Fragment>
                    <div>
                      <b>Start: </b>
                      {displayTime(dataset.start)}
                    </div>
                    <div>
                      <b>Duration: </b>
                      {format_time(duration)}
                    </div>
                  </Fragment>
                ) : (
                  <div className="d-flex align-items-center">
                    <div className="d-inline">
                      <FontAwesomeIcon
                        style={{ fontSize: '1rem' }}
                        icon={faExclamationTriangle}
                      ></FontAwesomeIcon>
                    </div>
                    <div className="text-left d-inline ml-1">empty</div>
                  </div>
                )}
              </div>
              <div className="d-flex">
                <Button
                  id="buttonViewDatasets"
                  className="btn-secondary mt-0 btn-edit"
                  onClick={(e) => {
                    history.push({
                      pathname: `datasets/${dataset['_id']}`,
                      state: dataset,
                    });
                  }}
                >
                  View
                </Button>
              </div>
            </div>

            <div
              className={classNames('animationDuration', { showInfo: !isOpen })}
            >
              <div className="dividerMetaData my-2"></div>
              <AdditionalInfo
                dataset={dataset}
                labelings={props.labelings}
                labels={props.labels}
              ></AdditionalInfo>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default DatasetTableEntry;
