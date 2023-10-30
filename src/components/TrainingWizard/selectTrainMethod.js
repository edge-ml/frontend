import {
  faGear,
  faSliders,
  faUserGear,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Fragment } from 'react';
import { Button } from 'reactstrap';

const SelectTrainMethod = () => {
  return (
    <Fragment>
      <div className="d-flex justify-content-around align-items-center font-weight-bold">
        <div>
          <Button color="primary">
            <div>AutoML</div>
            <FontAwesomeIcon icon={faUserGear}></FontAwesomeIcon>
          </Button>
          <div>
            Automatically generate a classification pipeline for your target
            device. You just select the windowing parameters and the evaluation
            strategy!
          </div>
        </div>
        <div>
          <Button color="primary">
            <div>Manual configuration</div>
            <FontAwesomeIcon icon={faGear}></FontAwesomeIcon>
          </Button>
          <div>
            Create your own classification pipeline by selecting the steps in
            the pipeline yourself!
          </div>
        </div>
      </div>
    </Fragment>
  );
};

SelectTrainMethod.validate = () => {
  return false;
};

export default SelectTrainMethod;
