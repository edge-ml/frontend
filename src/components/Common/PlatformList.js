import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faJsSquare } from '@fortawesome/free-brands-svg-icons';
import { faC } from '@fortawesome/free-solid-svg-icons';

const PlatformList = ({ platforms, size, color }) => {
  const platformsSet = new Set(platforms);

  if (platformsSet.size === 0) {
    return <div className="d-inline">None</div>;
  }

  return (
    <div className="d-inline">
      {platformsSet.has('JS') && (
        <FontAwesomeIcon
          className="mx-2"
          size={size}
          style={{ color: color }}
          icon={faJsSquare}
        ></FontAwesomeIcon>
      )}
      {platformsSet.has('C') && (
        <FontAwesomeIcon
          className="mx-2"
          size={size}
          style={{ color: color }}
          icon={faC}
        ></FontAwesomeIcon>
      )}
    </div>
  );
};

export default PlatformList;
