import React from 'react';
import Loader from '../../modules/loader';
import { ExportView } from './ExportView';

const ExportPage = () => {
  return (
    <Loader loading={false}>
      <ExportView />
    </Loader>
  );
};

export default ExportPage;
