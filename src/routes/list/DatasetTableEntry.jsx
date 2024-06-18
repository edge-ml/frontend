import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faList,
  faPen,
  faTimes,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

import React, { Fragment, useContext, useState } from 'react';
import { Badge, Button, Col, Row } from 'reactstrap';

import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';

import Checkbox from '../../components/Common/Checkbox';
import { displayTime } from '../../services/helpers';
import LabelBadge from '../../components/Common/LabelBadge';
import useProjectRouter from '../../Hooks/ProjectRouter';

// s as unix timestamp in milliseconds
const format_time = (s) => {
  const seconds = s / 1000;

  // Calculate the number of minutes and seconds from the remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  });

  // Calculate the number of hours, minutes, and seconds from the remaining minutes
  const hours = Math.floor(minutes / 60).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  });
  const remainingMinutes = (minutes % 60).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  });

  return `${hours}:${remainingMinutes}:${remainingSeconds}`;
};

const Labelings = (props) => {
  if (!props.dataset.labelings.length || !props.labelings.length) {
    return null;
  }

  const labelings = props.dataset.labelings
    .map((elm) =>
      props.labelings.find((labeling) => labeling._id === elm.labelingId),
    )
    .filter((elm) => elm !== undefined);

  return (
    <div className="mt-1 ms-4 p-lg-0 m-lg-0">
      <Row className="ps-1 ms-1 p-lg-0 m-lg-0 ">
        <Col>
          {labelings.map((labeling, idx) => (
            <Badge
              className="me-2 badgeSize badgeLabelings pb-2 mt-2 mb-2"
              color='unset'
              key={labeling + idx}
            >
              <div className="labelingBadgeWrapper">
                {labeling.name.toUpperCase()}
              </div>
              <div>
                {labeling.labels.map((label, index) => {
                  const labelTypes = props.dataset.labelings[idx].labels.map(
                    (elm) => elm.type,
                  );
                  if (!labelTypes.includes(label._id)) {
                    return null;
                  }
                  return (
                    <LabelBadge
                      key={label + index}
                      className="badgeSize mx-1"
                      color={label.color}
                    >
                      {label.name}
                    </LabelBadge>
                  );
                })}
              </div>
            </Badge>
          ))}
        </Col>
      </Row>
    </div>
  );
};

const Metadata = (props) => {
  if (!props.metaData) {
    return null;
  }
  const dataset = props.dataset;
  return (
    <div>
      <Row>
        <Col className="col-auto pe-0">
          <div className="mt-2 d-inline fw-bold">Metadata: </div>
        </Col>
        <Col>
          <div className="d-inline">
            {Object.keys(dataset.metaData).map((key, idx) => {
              const value = dataset.metaData[key];
              return (
                <Badge className="me-2 badgeSize" color="white">
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
        dataset={props.dataset}
      ></Labelings>
    </div>
  );
};

const DatasetInfo = (props) => {
  const { dataset } = props;
  const datasetStart = Math.min(...dataset.timeSeries.map((elm) => elm.start));
  const datasetEnd = Math.max(...dataset.timeSeries.map((elm) => elm.end));

  const duration = Math.max(datasetEnd - datasetStart, 0) || 0;
  const empty = dataset.timeSeries
    .map((elm) => elm.length)
    .every((elm) => elm === 0 || elm === null);
  return (
    <div className="text-left d-inline-block m-2">
      <div className="fw-bold font-size-lg h5 d-inline">
        {dataset.name}
      </div>
      {!empty ? (
        <Fragment>
          <div style={{ color: 'rgb(131, 136, 159)' }}>
            <small>
              <b>START </b>
              {displayTime(datasetStart)}
            </small>
          </div>
          <div style={{ color: 'rgb(131, 136, 159)' }}>
            <small>
              <b>DURATION </b>
              {format_time(duration)}
            </small>
          </div>
        </Fragment>
      ) : (
        <div className="d-flex align-items-center">
          <div className="d-inline" style={{ color: 'rgb(131, 136, 159)' }}>
            <FontAwesomeIcon
              style={{ fontSize: '1rem' }}
              icon={faExclamationTriangle}
            ></FontAwesomeIcon>
          </div>
          <div className="text-left d-inline ms-1">Dataset is empty</div>
        </div>
      )}
    </div>
  );
};

const ExpandButton = (props) => {
  return (
    <div
      className=" align-self-stretch d-flex"
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
        <Button color="secondary">
          <FontAwesomeIcon
            icon={!props.isOpen ? faList : faTimes}
          ></FontAwesomeIcon>
        </Button>
      </div>
    </div>
  );
};

const DatasetTableEntry = (props) => {
  const dataset = props.dataset;
  const history = useNavigate();
  const navigate = useProjectRouter();

  const [isOpen, setOpen] = useState(false);
  return (
    <Fragment>
      <div
        className="datasetCard"
        style={{
          background: props.index % 2 === 1 ? 'rgb(249, 251, 252)' : '',
        }}
      >
        <div className="d-flex">
          <div className="d-flex align-items-center p-2 ms-2 me-0 ml-md-3 me-md-3">
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
                  ></AdditionalInfo>
                </div>
              </Col>
              <Col className="col-2 ">
                <div className="d-flex justify-content-end align-items-center h-100">
                  <div className="d-block d-lg-none me-2">
                    <ExpandButton
                      isOpen={isOpen}
                      setOpen={setOpen}
                    ></ExpandButton>
                  </div>
                  <Button
                    outline
                    color='danger'
                    className="btn-delete me-2"
                    onClick={() => props.deleteEntry(dataset._id)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt}></FontAwesomeIcon>{' '}
                  </Button>
                  <Button
                    outline
                    color="primary"
                    className="btn-edit me-3 me-md-4"
                    onClick={() => navigate(`Datasets/${dataset._id}`)}
                  >
                    <FontAwesomeIcon icon={faPen}></FontAwesomeIcon>
                  </Button>
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
          <AdditionalInfo
            dataset={dataset}
            labelings={props.labelings}
          ></AdditionalInfo>
        </div>
      </div>
    </Fragment>
  );
};

export default DatasetTableEntry;
