import React, { useEffect, useState } from 'react';
import Loader from '../../modules/loader';
import { ValidationView } from './ValidationView';
import { getTrainedModels } from '../../services/ApiServices/MlService';

const ValidationPage = () => {
  let [loading, setLoading] = useState(false);
  let [models, setModels] = useState([]);

  useEffect(() => {
    console.log('validation - useEffect');
    getTrainedModels().then(m => {
      console.log('validation - got data', m);

      setModels(m);
      setLoading(false);
    });
  }, []);

  return (
    <Loader loading={loading}>
      <ValidationView
        models={models}
        // selectedModel={[
        //   {
        //     id: 'idxxddddddddddd', name: 'My Little Model', creation_date: Date.now() - 10000, classifier: 'Ciks Classifier', accuracy: 0.15, precision: 0.9, f1_score: 0.4,

        //   }
        // ]}
      />
    </Loader>
  );
};

export default ValidationPage;
