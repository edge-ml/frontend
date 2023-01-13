import React from 'react';
import Select from 'react-select';
import {
  Badge,
  InputGroup,
  Input,
  Card,
  CardBody,
  CardHeader,
} from 'reactstrap';

import { withLoader } from '../../modules/loader';

export const validationSelectOptions = {
  none: { value: 'none', label: 'None' },
  LOSO: { value: 'LOSO', label: 'Leave One Subject Out' },
};

const ValidationMethodsViewRaw = ({
  testSplit,
  onTestSplitChange,
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
      <h6>Train Test Split</h6>
      <div className="d-flex flex-row align-items-baseline justify-content-between w-100">
        <span>Split: </span>
        <InputGroup style={{ width: '200px' }}>
          <Input
            type={'text'}
            value={testSplit}
            onChange={onTestSplitChange}
          ></Input>
        </InputGroup>
      </div>
      <h6>Validation</h6>
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
      {currentValidationMethod &&
      currentValidationMethod !== validationSelectOptions.none.value ? (
        <hr></hr>
      ) : null}
      {currentValidationMethod === validationSelectOptions.LOSO.value ? (
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
      <br />
      <small>
        <strong>
          <em>Note:</em>
        </strong>{' '}
        Datasets without the selected metadata present will <strong>not</strong>{' '}
        be ignored, but instead collectively included in the validation as
        another group.
      </small>
    </div>
  );
};

const withCard = (name, Wrapped) => (props) =>
  (
    <Card className="text-left">
      <CardHeader>
        <h4>{name}</h4>
      </CardHeader>
      <CardBody className="d-flex flex-column align-items-start flex-column justify-content-between">
        <Wrapped {...props} />
      </CardBody>
    </Card>
  );

export const ValidationMethodsView = withCard(
  'Validation and Test',
  withLoader(
    (pred) => pred.customMetaData && pred.validationMethods,
    ValidationMethodsViewRaw
  )
);
