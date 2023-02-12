import React, { Fragment } from 'react';
import LabelingTableEntry from './LabelingTableEntry';
import { Row, Col, Button } from 'reactstrap';

const LabelingTable = (props) => {
  return (
    <div className="pl-2 pr-2 pl-md-4 pr-md-4 pb-2">
      <Fragment>
        <div className="w-100 d-flex justify-content-between align-items-center mb-2">
          <div className="font-weight-bold h4 justify-self-start">
            LABELING SETS
          </div>
          <div className="justify-content-end">
            <Button
              outline
              onClick={props.onModalAddLabeling}
              className="btn-download-all ml-auto"
            >
              Create Labeling Set
            </Button>
          </div>
        </div>
        <div style={{ borderRadius: 10 }}>
          <div className="datasets-header-wrapper d-flex">
            <div className="w-100">
              <Row>
                <Col>
                  <div>Name</div>
                </Col>
              </Row>
            </div>
          </div>
          <div
            className="w-100 position-relative"
            style={{
              border: '2px solid rgb(230, 230, 234)',
              borderRadius: '0px 0px 10px 10px',
              overflow: 'hidden',
            }}
          >
            {props.labelings.map((labeling, index) => (
              <LabelingTableEntry
                labeling={labeling}
                labels={props.labels}
                onClickEdit={props.onClickEdit}
                index={index}
              />
            ))}
          </div>
        </div>
      </Fragment>
    </div>
  );
};

export default LabelingTable;
