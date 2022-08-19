import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleRight,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

import React, { Fragment, useState } from 'react';
import { Badge, Button, Col, Row } from 'reactstrap';

import { useHistory } from 'react-router-dom';
import classNames from 'classnames';

import Checkbox from '../../components/Common/Checkbox';

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
      <Row>
        <Col className="col-auto pr-0">
          <b>Labelings: </b>
        </Col>
        <Col>
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
        </Col>
      </Row>
    </div>
  );
};

const Metadata = (props) => {
  const dataset = props.dataset;
  return (
    <div>
      <Row>
        <Col className="col-auto pr-0">
          <div className="mt-2 d-inline font-weight-bold">Metadata: </div>
        </Col>
        <Col>
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
        </Col>
      </Row>
    </div>
  );
};

const AdditionalInfo = (props) => {
  const dataset = props.dataset;

  return (
    <div className="text-left m-2">
      <Metadata dataset={dataset}></Metadata>
      <Labelings
        labelings={props.labelings}
        labels={props.labels}
        dataset={props.dataset}
      ></Labelings>
    </div>
  );
};

const DatasetInfo = (props) => {
  const { dataset } = props;
  const duration = Math.max(dataset.end - dataset.start, 0);
  return (
    <div className="text-left d-inline-block m-2">
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
  );
};

const ExpandButton = (props) => {
  return (
    <div
      className="p-2 align-self-stretch d-flex"
      onClick={(e) => {
        e.stopPropagation();
        props.setOpen(!props.isOpen);
      }}
    >
      <div
        className={classNames('d-flex align-items-center animationDuration', {
          collapse_arrow: props.isOpen,
        })}
      >
        <FontAwesomeIcon
          style={{ fontSize: '2rem' }}
          icon={faAngleRight}
        ></FontAwesomeIcon>
      </div>
    </div>
  );
};

const DatasetTableEntry = (props) => {
  const dataset = props.dataset;
  const history = useHistory();

  const [isOpen, setOpen] = useState(false);

  return (
    <Fragment>
      <div className="card mt-2 datasetCard">
        <div className="d-flex">
          <div className="d-flex align-items-center p-2">
            <Checkbox
              isSelected={props.isSelected}
              className="d-inline-block"
              // onClick={(e) => console.log("Click")}
              onClick={(e) => props.toggleCheck(e, dataset['_id'])}
            ></Checkbox>
          </div>
          <div className="w-100">
            <Row>
              <Col className="text-left align-self-center col-lg-4 col-xl-3">
                <DatasetInfo dataset={dataset}></DatasetInfo>
              </Col>
              <Col className="d-none d-lg-block">
                <div className="d-flex h-100 flex-column justify-content-center">
                  <AdditionalInfo
                    dataset={dataset}
                    labelings={props.labelings}
                    labels={props.labels}
                  ></AdditionalInfo>
                </div>
              </Col>
              <Col className="col-2 ">
                <div className="d-flex justify-content-end align-items-center h-100">
                  <Button
                    color="danger"
                    onClick={() => props.deleteEntry(dataset._id)}
                  >
                    Delete
                  </Button>
                  <Button
                    color="primary"
                    className="btn-secondary m-2 btn-edit"
                    onClick={(e) => {
                      history.push({
                        pathname: `datasets/${dataset['_id']}`,
                        state: dataset,
                      });
                    }}
                  >
                    View
                  </Button>

                  <div className="d-block d-lg-none m-2">
                    <ExpandButton
                      isOpen={isOpen}
                      setOpen={setOpen}
                    ></ExpandButton>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
        <div
          className={classNames('animationDuration d-block d-lg-none', {
            showInfo: !isOpen,
          })}
        >
          <div className="mx-2">
            <div className="dividerMetaData"></div>
          </div>
          <AdditionalInfo
            dataset={dataset}
            labelings={props.labelings}
            labels={props.labels}
          ></AdditionalInfo>
        </div>
      </div>
    </Fragment>
  );
};

export default DatasetTableEntry;
