import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToolbox } from '@fortawesome/free-solid-svg-icons';
import EdgeMLBrandLogo from '../EdgeMLBrandLogo/EdgeMLBrandLogo';
import logoSvg from '../../logo.svg';

import './index.css';

const UnderConstruction = () => {
  return (
    <div class="wrapper">
      <div className="d-flex justify-content-center align-items-center m-5">
        <img style={{ width: '150px' }} src={logoSvg} />
        <div className="text">edge-ml</div>
      </div>
      <div className="text text-center">
        Check out machine learning on{' '}
        <a href="https://beta.edge-ml.org" target="_blank">
          edge-ml beta
        </a>
      </div>
    </div>
  );
};

export default UnderConstruction;
