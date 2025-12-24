import React from "react";
import {
  Badge,
  Card,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
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
    <Stack>
      <Text fw={600}>Train Test Split</Text>
      <Group justify="space-between" align="baseline">
        <Text size="sm">Split:</Text>
        <TextInput
          value={testSplit}
          onChange={onTestSplitChange}
          w={200}
        />
      </Group>
      <Text fw={600}>Validation</Text>
      <Group justify="space-between" align="baseline">
        <Text size="sm">Method:</Text>
        <Select
          value={currentValidationMethod}
          onChange={(value) => onValidationMethodChange(value)}
          data={validationMethods.map((x) => validationSelectOptions[x])}
          w={200}
        />
      </Group>
      {currentValidationMethod &&
      currentValidationMethod !== validationSelectOptions.none.value ? (
        <Divider my="sm" />
      ) : null}
      {currentValidationMethod === validationSelectOptions.LOSO.value ? (
        <LOSO
          customMetaData={customMetaData}
          options={validationMethodOptions}
          onOptionsChange={onValidationMethodOptionsChange}
        />
      ) : null}
    </Stack>
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
    <Stack>
      <Text size="sm">
        Datasets will be grouped together according to the selected "leave one
        out" variable, and challenged against the others.
      </Text>
      <Group justify="space-between" align="center">
        <Text fw={600} size="sm">
          "leave one out" variable:
        </Text>
        <Select
          value={selectedMetaDataKey}
          onChange={(value) =>
            onOptionsChange({ ...options, selectedMetaDataKey: value })
          }
          data={customMetaData.metaDataKeys.map((x) => ({
            value: x,
            label: x,
          }))}
          w={200}
        />
      </Group>
      <Text fw={600} size="sm">
        Available Metadata in Datasets: metadata (#datasets)
      </Text>
      <Group gap="xs" wrap="wrap">
        {Object.entries(customMetaData.metaDataKeyFrequency).map(
          ([key, freq]) => (
            <Badge key={key} radius="xl">{`${key} (${freq})`}</Badge>
          )
        )}
      </Group>
      <Text size="xs">
        <Text component="span" fw={700} fs="italic">
          Note:
        </Text>{" "}
        Datasets without the selected metadata present will <strong>not</strong>{" "}
        be ignored, but instead collectively included in the validation as
        another group.
      </Text>
    </Stack>
  );
};

const withCard = (name, Wrapped) => (props) => (
  <Card>
    <Text fw={700} size="lg">
      {name}
    </Text>
    <Stack mt="sm" align="flex-start" justify="space-between">
      <Wrapped {...props} />
    </Stack>
  </Card>
);

export const ValidationMethodsView = withCard(
  "Validation and Test",
  withLoader(
    (pred) => pred.customMetaData && pred.validationMethods,
    ValidationMethodsViewRaw
  )
);
