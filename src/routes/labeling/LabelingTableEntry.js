import React, { Fragment } from 'react';
import { Row, Col, Button, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
const LabelingTableEntry = (props) => {
  const labeling = props.labeling;
  return (
    <Fragment>
      <div
        className="labelingCard"
        style={{
          background: props.index % 2 === 1 ? 'rgb(249, 251, 252)' : '',
        }}
      >
        <div className="d-flex">
          <div className="w-100">
            <Row className="p-1">
              <Col className="text-left align-self-center col-lg-4 col-xl-3">
                <div className="text-left d-inline-block m-2">
                  <div
                    className={
                      labeling.name !== ''
                        ? 'font-weight-bold font-size-lg h5 d-inline'
                        : 'font-weight-normal font-italic font-size-lg h5 d-inline'
                    }
                  >
                    {labeling.name !== '' ? labeling.name : 'Untitled'}
                  </div>
                </div>
              </Col>
              <Col className="d-none d-lg-block align-self-center">
                <div className="d-flex h-100 justify-content-center">
                  <Labeling labeling={props.labeling} labels={props.labels} />
                </div>
              </Col>
              <Col className="col-2 align-self-center">
                <div className="d-flex justify-content-end ">
                  <Button
                    className="mr-3 mr-md-4 "
                    onClick={() => props.onClickEdit(labeling)}
                    color="secondary"
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default LabelingTableEntry;

const Labeling = (props) => {
  let labels = [];
  props.labeling.labels.forEach((labelId, index) => {
    let label = props.labels.filter((label) => label['_id'] === labelId)[0];
    if (!label) {
      return null;
    }
    labels.push(label);
  });

  if (labels.length === 0) {
    return null;
  } else {
    return (
      <Badge className="mr-2 badgeSize badgeLabelings pb-2 mt-2 mb-2">
        {labels.map((label, index) => {
          return (
            <Badge
              key={index}
              className={
                label.name === ''
                  ? 'font-italic font-weight-normal badgeSize mx-1'
                  : 'badgeSize mx-1'
              }
              style={{ backgroundColor: label.color }}
            >
              {label.name !== '' ? label.name : 'Untitled'}{' '}
            </Badge>
          );
        })}
      </Badge>
    );
  }
};
