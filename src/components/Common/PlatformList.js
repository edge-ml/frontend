import { ReactComponent as CPPSVG } from './CPP.svg';
import { ReactComponent as JSSVG } from './JS.svg';

const PlatformList = ({ platforms, size, color }) => {
  const platformsSet = new Set(platforms);

  if (platformsSet.size === 0) {
    return <div className="d-inline">No Platforms</div>;
  }
  return (
    <div className="child-gap">
      {platformsSet.has('JS') && (
        <JSSVG style={{ height: '2rem', width: '2rem' }}></JSSVG>
      )}
      {platformsSet.has('C') && (
        <CPPSVG style={{ height: '2rem', width: '2rem' }}></CPPSVG>
      )}
    </div>
  );
};

export default PlatformList;
