import {
  faGear,
  faGears,
  faSliders,
  faUserGear,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Fragment } from 'react';
import { Button } from 'reactstrap';
import PlatformList from '../Common/PlatformList';

const TrainingMethod = (pipeline, onSelectTrainingMethod) => {
  let platforms = new Set(
    pipeline.steps
      .filter((elm) => ['PRE', 'EVAL'].includes(elm.type))[0]
      .options.map((elm) => elm.platforms)
      .flat()
  );

  pipeline.steps.forEach((step) => {
    if (step.type === 'PRE' || step.type === 'CORE') {
      const plf = new Set(step.options.map((elm) => elm.platforms).flat());
      platforms = new Set([...platforms].filter((elm) => plf.has(elm)));
    }
  });
  return (
    <div
      key={pipeline.name}
      className="edgeml-border p-2 m-2 cursor-pointer hover-bigger"
      onClick={() => onSelectTrainingMethod(pipeline)}
    >
      <div className="d-flex justify-content-between">
        <div>
          <div className="font-weight-bold">{pipeline.name}</div>
          <div>{pipeline.description}</div>
        </div>
        <div className="d-flex align-items-center">
          <PlatformList size="2x" platforms={platforms}></PlatformList>
        </div>
      </div>
    </div>
  );
};

const SelectTrainMethod = ({ pipelines, onSelectTrainingMethod }) => {
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
