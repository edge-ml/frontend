import React, { useEffect, useState } from 'react';
import BLEDeploy from './BLEDeploy';

const DeployFeatures = ({ featureNames, onUpdateDeployFeautures }) => {
  const [additionalFeatures, setAdditionalFeatures] = useState({});

  const onUpdateState = (key, stateUpdae) => {
    setAdditionalFeatures({ ...additionalFeatures, [key]: stateUpdae });
  };

  useEffect(() => {
    onUpdateDeployFeautures(additionalFeatures);
  }, [additionalFeatures]);

  const FEATURE_MAP = {
    BLE_DEPLOY: (
      <BLEDeploy
        onUpdateState={(stateUpdate) =>
          onUpdateState('BLE_DEPLOY', stateUpdate)
        }
      ></BLEDeploy>
    ),
  };

  return featureNames.map((name) => FEATURE_MAP[name]);
};

export default DeployFeatures;
