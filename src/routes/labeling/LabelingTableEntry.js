import React, { Fragment } from 'react';
import { Row, Col, Button, Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import Checkbox from '../../components/Common/Checkbox';
import LabelBadge from '../../components/Common/LabelBadge';
import { EdgeMLTableEntry } from '../../components/Common/EdgeMLTable';

const LabelingTableEntry = ({
  labelings,
  labeling,
  isSelected,
  toggleCheck,
}) => {
  const onDelete = () => {};

  const onClickEdit = () => {};

  return (
    <EdgeMLTableEntry key={'labeling' + labeling._id}>
      <div className="d-flex align-items-center p-2 ml-2 mr-0 ml-md-3 mr-md-3">
        <Checkbox
          isSelected={isSelected}
          className="d-inline-block"
          onClick={(e) => toggleCheck(e, labeling._id)}
        ></Checkbox>
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
                <Labeling labeling={labeling} />
              </div>
            </Col>
            <Col className="d-flex flex-nowrap col-2 align-self-center justify-content-end">
              <Button
                className="btn-delete mr-3 mr-md-4"
                onClick={(e) => onDelete()}
              >
                <FontAwesomeIcon icon={faTrashAlt}></FontAwesomeIcon>{' '}
              </Button>
              <Button
                //outline
                className="mr-3 mr-md-4"
                onClick={() => onClickEdit()}
              >
                <FontAwesomeIcon icon={faPen} />
              </Button>
            </Col>
          </Row>
        </div>
      </div>
    </EdgeMLTableEntry>
  );
};

export default LabelingTableEntry;

const Labeling = (props) => {
  console.log(props);
  const labels = props.labeling.labels;

  if (labels.length === 0) {
    return null;
  } else {
    return (
      <div>
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
