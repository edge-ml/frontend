import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleRight,
  faCross,
  faEllipsisV,
  faExclamationTriangle,
  faEye,
  faInfoCircle,
  faList,
  faPen,
  faPenAlt,
  faQuestion,
  faTimes,
  faTrash,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';

import React, { Fragment, useState } from 'react';
import { Badge, Button, Col, Row } from 'reactstrap';

import { useHistory } from 'react-router-dom';
import classNames from 'classnames';

import Checkbox from '../../components/Common/Checkbox';
import { hexToRgb } from '../../services/ColorService';

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

  return (
    <div className="mt-1 ml-4 p-lg-0 m-lg-0">
      <Row className="pl-1 ml-1 p-lg-0 m-lg-0 ">
        <Col>
          {labelings.map((labeling, idx) => (
            <Badge className="mr-2 badgeSize badgeLabelings pb-2 mt-2 mb-2">
              <div className="labelingBadgeWrapper">
                {labeling.name.toUpperCase()}
              </div>
              <div>
                {labeling.labels.map((label) => {
                  const labelTypes = props.dataset.labelings[idx].labels.map(
                    (elm) => elm.type
                  );
                  if (!labelTypes.includes(label._id)) {
                    return null;
                  }
                  return (
                    <Badge
                      className="badgeSize mx-1"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </Badge>
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
        dataset={props.dataset}
      ></Labelings>
    </div>
  );
};

const DatasetInfo = (props) => {
  const { dataset } = props;
  const duration = Math.max(dataset.end - dataset.start, 0) || 0;
  console.log('duration: ', duration);
  return (
    <div className="text-left d-inline-block m-2">
      <div className="font-weight-bold font-size-lg h5 d-inline">
        {dataset.name}
      </div>
      {duration != 0 ? (
        <Fragment>
          <div style={{ color: 'rgb(131, 136, 159)' }}>
            <small>
              <b>START </b>
              {displayTime(dataset.start)}
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
          <div className="text-left d-inline ml-1">dataset empty</div>
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
  const history = useHistory();

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
          <div className="d-flex align-items-center p-2 ml-2 mr-0 ml-md-3 mr-md-3">
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
                  <div className="d-block d-lg-none mr-2">
                    <ExpandButton
                      isOpen={isOpen}
                      setOpen={setOpen}
                    ></ExpandButton>
                  </div>
                  <Button
                    className="btn-delete mr-2"
                    onClick={() => props.deleteEntry(dataset._id)}
                  >
                    <FontAwesomeIcon icon={faTrashAlt}></FontAwesomeIcon>{' '}
                  </Button>
                  <Button
                    color="secondary"
                    className="btn-edit mr-3 mr-md-4"
                    onClick={(e) => {
                      history.push({
                        pathname: `datasets/${dataset['_id']}`,
                        state: dataset,
                      });
                    }}
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
