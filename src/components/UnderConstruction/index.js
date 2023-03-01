import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToolbox } from '@fortawesome/free-solid-svg-icons';

import './index.css';

const UnderConstruction = () => {
  return (
    <div class="wrapper">
      <FontAwesomeIcon
        icon={faToolbox}
        className="icon"
        size="10x"
      ></FontAwesomeIcon>
      <div className="text">Under Construction</div>
    </div>
  );
};

export default UnderConstruction;
