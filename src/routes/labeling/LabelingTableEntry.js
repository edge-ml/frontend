import React, { Fragment } from 'react';
import { Row, Col, Button, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Checkbox from '../../components/Common/Checkbox';
import LabelBadge from '../../components/Common/LabelBadge';
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
          <div className="d-flex align-items-center p-2 ml-2 mr-0 ml-md-3 mr-md-3">
            <Checkbox
              isSelected={props.isSelected}
              className="d-inline-block"
              onClick={(e) => props.toggleCheck(e, labeling['_id'])}
            ></Checkbox>
          </div>
          <div className="w-100">
            <Row className="p-1">
              <Col className="text-left align-self-center col-lg-4 col-xl-3">
                <div className="text-left d-inline-block m-2 text-break">
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
                <div className="d-flex flex-wrap h-100 justify-content-start">
                  <Labeling labeling={props.labeling} labels={props.labels} />
                </div>
              </Col>
              <Col className="d-flex flex-nowrap col-2 align-self-center justify-content-end">
                <Button
                  className="btn-delete mr-2"
                  onClick={(e) =>
                    props.onClickDeleteLabelingIcon(labeling['_id'])
                  }
                >
                  <FontAwesomeIcon icon={faTrashAlt}></FontAwesomeIcon>{' '}
                </Button>
                <Button
                  //outline
                  className="mr-3 mr-md-4"
                  onClick={() => props.onClickEdit(labeling)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </Button>
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
  console.log(props);
  // '  let labels = [];
  //   props.labeling.labels.forEach((labelId, index) => {
  //     let label = props.labels.filter((label) => label['_id'] === labelId)[0];
  //     if (!label) {
  //       return null;
  //     }
  //     labels.push(label);
  //   });'

  const labels = props.labeling.labels;

  if (labels.length === 0) {
    return null;
  } else {
    return (
      <div className="mr-2 badgeSize pb-2 mt-2 mb-2">
        {labels.map((label, index) => {
          return (
            <LabelBadge key={label._id} color={label.color}>
              {label.name !== '' ? label.name : 'Untitled'}{' '}
            </LabelBadge>
          );
        })}
      </div>
    );
  }
};
