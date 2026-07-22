import React from "react";
import Select from "react-select";
import {
  Badge,
  TextInput,
  Card,
  Text,
} from "@mantine/core";

import { withLoader } from "../../modules/loader";

export const validationSelectOptions = {
  none: { value: "none", label: "None" },
  LOSO: { value: "LOSO", label: "Leave One Subject Out" },
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
  return (
    <div style={{ width: "100%", textAlign: "left" }}>
      <h6>Train Test Split</h6>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", width: "100%" }}>
        <span>Split: </span>
        <TextInput
          value={testSplit}
          onChange={onTestSplitChange}
          style={{ width: "200px" }}
        />
      </div>
      <h6>Validation</h6>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" }}>
        <span>Method: </span>
        <span style={{ minWidth: "200px" }}>
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
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <h6>"leave one out" variable: </h6>
        <span style={{ minWidth: "200px" }}>
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
            <Badge key={key} style={{ marginRight: "0.25rem" }}>{`${key} (${freq})`}</Badge>
          )
        )}
      </div>
      <br />
      <Text size="sm" c="dimmed">
        <strong>
          <em>Note:</em>
        </strong>{" "}
        Datasets without the selected metadata present will <strong>not</strong>{" "}
        be ignored, but instead collectively included in the validation as
        another group.
      </Text>
    </div>
  );
};

const withCard = (name, Wrapped) => (props) => (
  <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: "left" }}>
    <Card.Section>
      <Text fw={700} size="lg" p="md"><h4>{name}</h4></Text>
    </Card.Section>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", padding: "1rem" }}>
      <Wrapped {...props} />
    </div>
  </Card>
);

export const ValidationMethodsView = withCard(
  "Validation and Test",
  withLoader(
    (pred) => pred.customMetaData && pred.validationMethods,
    ValidationMethodsViewRaw
  )
);
