import { Fragment } from 'react';
import { Badge, Container, Button, Col, Row } from 'reactstrap';
import '../index.css';
import Checkbox from '../../../components/Common/Checkbox';
import classNames from 'classnames';

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
          <div
            className="d-flex align-items-center p-2 ml-2 mr-0 ml-md-3 mr-md-3"
            style={{ visibility: props.disabled ? 'hidden' : 'visible' }}
          >
            <Checkbox
              isSelected={props.isSelected}
              className="d-inline-block"
              disabled={props.disabled}
              onClick={
                !props.disabled
                  ? (e) => props.toggleCheck(e, labeling['_id'])
                  : () => {}
              }
            ></Checkbox>
          </div>
          <div className="w-100">
            <Row className="p-1">
              <Col
                className="text-left align-self-center col-lg-4 col-xl-3"
                style={{ opacity: props.disabled ? 0.5 : 1 }}
              >
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
              <Col
                className="d-none d-lg-block align-self-center"
                style={{ opacity: props.disabled ? 0.5 : 1 }}
              >
                <div className="d-flex flex-wrap h-100 justify-content-start">
                  <Labeling labeling={props.labeling} />
                </div>
              </Col>
              <Col className="text-right align-self-center col-2">
                <div className="text-right text-break p-2 ml-2 mr-0 ml-md-3 mr-md-3">
                  {props.count > 0 ? (
                    `${props.count} ${
                      props.count === 1 ? 'dataset' : 'datasets'
                    }`
                  ) : (
                    <b>No dataset</b>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

const Labeling = (props) => {
  const labels = props.labeling.labels;

  if (labels.length === 0) {
    return null;
  } else {
    return (
      <div className="mr-2 badgeSize pb-2 mt-2 mb-2">
        {labels.map((label, index) => {
          return (
            <Badge
              key={label._id}
              className={
                label.name === ''
                  ? 'font-italic font-weight-normal badgeSize mx-1 border border-dark'
                  : 'badgeSize mx-1 my-1 border border-dark'
              }
              style={{ backgroundColor: label.color }}
            >
              {label.name !== '' ? label.name : 'Untitled'}{' '}
            </Badge>
          );
        })}
      </div>
    );
  }
};

const Wizard_SelectLabeling = ({
  labelings,
  datasets,
  setLabeling,
  toggleZeroClass,
  zeroClass,
  selectedLabeling,
  onNext,
  onBack,
  footer,
}) => {
  const countDatasets = (labeling) => {
    return datasets
      .map((elm) => elm.labelings.map((l) => l.labelingId))
      .flat()
      .filter((elm) => elm === labeling._id).length;
  };

  return (
    <Fragment>
      <div className="w-100 d-flex justify-content-between align-items-center mb-2">
        <div className="font-weight-bold h4 justify-self-start">
          1. Select Labeling
        </div>
      </div>
      {labelings.length > 0 ? (
        <div style={{ borderRadius: 10 }}>
          <div
            className="w-100 position-relative"
            style={{
              border: '2px solid rgb(230, 230, 234)',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            {labelings
              // .filter((elm) => countDatasets(elm))
              .map((labeling, index) => (
                <LabelingTableEntry
                  disabled={countDatasets(labeling) === 0}
                  key={labeling._id}
                  count={countDatasets(labeling)}
                  index={index}
                  labeling={labeling}
                  isSelected={
                    selectedLabeling
                      ? selectedLabeling._id === labeling._id
                      : false
                  }
                  toggleCheck={() => setLabeling(labeling)}
                />
              ))}
          </div>
        </div>
      ) : (
        <Container
          className="d-flex flex-column justify-content-center align-items-center"
          style={{ height: '75vh' }}
        >
          <div className="text-center">No labeling sets available yet.</div>
        </Container>
      )}
      <div
        className="d-flex pt-2"
        style={{ marginRight: '2px', marginLeft: '2px' }}
      >
        <div className="d-flex align-items-center p-2 ml-2 mr-0 ml-md-3">
          <Checkbox
            onClick={() => toggleZeroClass(!zeroClass)}
            className="d-inline-block"
            isSelected={zeroClass}
          ></Checkbox>
        </div>
        <div className="d-flex align-items-center">Use 0-Class</div>
      </div>
    </Fragment>
  );
};

export default Wizard_SelectLabeling;
