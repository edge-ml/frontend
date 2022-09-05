import React from 'react';
import Select from 'react-select';
import { Badge } from 'reactstrap';

import { withLoader } from '../../modules/loader';

const validationSelectOptions = {
  none: { value: 'none', label: 'None' },
  LOSO: { value: 'LOSO', label: 'Leave One Subject Out' },
};

const ValidationMethodsViewRaw = ({
  customMetaData,
  currentValidationMethod,
  validationMethods,
  onValidationMethodChange = () => {},
  validationMethodOptions,
  onValidationMethodOptionsChange = () => {},
}) => {
  console.log(currentValidationMethod);

  return (
    <div className="w-100 text-left">
      <div className="d-flex flex-row align-items-baseline justify-content-between">
        <span>Method: </span>
        <span style={{ minWidth: '200px' }}>
          <Select
            value={validationSelectOptions[currentValidationMethod]}
            onChange={(x) => onValidationMethodChange(x.value)}
            options={validationMethods.map((x) => validationSelectOptions[x])}
          />
        </span>
      </div>
      {currentValidationMethod && currentValidationMethod !== 'none' ? (
        <hr></hr>
      ) : null}
      {currentValidationMethod === 'LOSO' ? (
        <LOSO
          customMetaData={customMetaData}
          options={validationMethodOptions}
          onOptionsChange={onValidationMethodOptionsChange}
        />
      ) : null}
    </div>
  );
};

const LOSO = ({
  customMetaData,
  options: { selectedMetaDataKey, ...options } = {
    selectedMetaDataKey: null,
  },
  onOptionsChange,
}) => {
  return (
    <div>
      <p>
        Datasets will be grouped together according to the selected "leave one
        out" variable, and challenged against the others.
      </p>
      <div className="d-flex flex-row align-items-center justify-content-between">
        <h6>"leave one out" variable: </h6>
        <span style={{ minWidth: '200px' }}>
          <Select
            value={{ value: selectedMetaDataKey, label: selectedMetaDataKey }}
            onChange={(x) =>
              onOptionsChange({ ...options, selectedMetaDataKey: x.value })
            }
            options={customMetaData.metaDataKeys.map((x) => ({
              value: x,
              label: x,
            }))}
          />
        </span>
      </div>
      <h6>Available Metadata in Datasets: metadata (#datasets)</h6>
      <div>
        {Object.entries(customMetaData.metaDataKeyFrequency).map(
          ([key, freq]) => (
            <Badge pill className="mr-1">{`${key} (${freq})`}</Badge>
          )
        )}
      </div>
    </div>
  );
};

const withCard = (name, Wrapped) => (props) =>
  (
    <div className="card" style={{ border: '0px solid white' }}>
      <div className="card-body d-flex flex-column align-items-start flex-column justify-content-between">
        <div>
          <h4>{name}</h4>
        </div>
        <Wrapped {...props} />
      </div>
      {/* <div className="h-100"/> */}
    </div>
  );

export const ValidationMethodsView = withCard(
  'Validation Methods',
  withLoader(
    (pred) => pred.customMetaData && pred.validationMethods,
    ValidationMethodsViewRaw
  )
);
