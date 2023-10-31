import {
  faGear,
  faGears,
  faSliders,
  faUserGear,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Fragment } from 'react';
import { Button } from 'reactstrap';

const TrainingMethod = (pipeline, onSelectTrainingMethod) => {
  return (
    <div
      key={pipeline.name}
      className="edgeml-border p-2 m-2 cursor-pointer hover-bigger"
      onClick={() => onSelectTrainingMethod(pipeline)}
    >
      <div>
        <div className="font-weight-bold">{pipeline.name}</div>
        <div>{pipeline.description}</div>
      </div>
    </div>
  );
};

const SelectTrainMethod = ({ pipelines, onSelectTrainingMethod }) => {
  console.log(pipelines);
  return (
    <Fragment>
      {pipelines.map((elm) => TrainingMethod(elm, onSelectTrainingMethod))}
    </Fragment>
  );
};

SelectTrainMethod.validate = () => {
  return false;
};

export default SelectTrainMethod;
