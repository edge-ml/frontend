import React from "react";
import {
  Badge,
  Card,
  Checkbox,
  Group,
  Radio,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";

import Loader from "../../modules/loader";

export const LabelingView = ({
  labelings,
  selectedLabeling,
  labels,
  changeSelectedLabeling,
  useUnlabelledFor,
  changeUnlabelledFor,
  unlabelledNameFor,
  changeUnlabelledName,
  selectedLabelsFor,
  changeLabelSelection,
}) => {
  return (
    <Card>
      <Text fw={700} size="lg">
        Target Labeling
      </Text>
      <Stack align="flex-start" justify="space-between" mt="sm">
        <Loader loading={!labelings && !labels}>
          <Stack gap="sm">
            {labelings && labelings.length
              ? labelings.map((x) => {
                  return (
                    <Stack key={x.id} gap={6}>
                      <Radio
                        id={x.id}
                        label={x.name}
                        checked={selectedLabeling === x.id}
                        onChange={() => changeSelectedLabeling(x.id)}
                      />
                      <Group wrap="wrap" gap="xs" align="center">
                        {x.labels.map((labelId) => {
                          const label = labels.find(
                            (label) => label.id === labelId
                          );
                          return (
                            <Badge
                              key={labelId}
                              style={{ backgroundColor: label.color }}
                            >
                              <Group gap={6} align="center">
                                <Text size="xs" fw={700}>
                                  {label.name}
                                </Text>
                                <Checkbox
                                  size="xs"
                                  disabled={selectedLabeling !== x.id}
                                  checked={selectedLabelsFor[x.id][labelId]}
                                  onChange={() =>
                                    changeLabelSelection(x.id, labelId)
                                  }
                                />
                              </Group>
                            </Badge>
                          );
                        })}
                        <Badge>
                          <Group gap="xs" align="center">
                            <TextInput
                              value={unlabelledNameFor[x.id]}
                              onChange={(e) =>
                                changeUnlabelledName(e.target.value, x.id)
                              }
                              disabled={selectedLabeling !== x.id}
                              styles={{
                                input: {
                                  backgroundColor: "rgba(0,0,0,0)",
                                  border: "none",
                                  color: "white",
                                  fontWeight: 700,
                                  padding: 0,
                                  height: "12px",
                                  width: "60px",
                                },
                              }}
                            />
                            <Checkbox
                              size="xs"
                              disabled={selectedLabeling !== x.id}
                              checked={useUnlabelledFor[x.id]}
                              onChange={(e) =>
                                changeUnlabelledFor(e.currentTarget.checked, x.id)
                              }
                            />
                          </Group>
                        </Badge>
                      </Group>
                    </Stack>
                  );
                })
              : "There are no labelings defined"}
          </Stack>
        </Loader>
        <Text size="xs" mt="md">
          <Text component="span" fw={700} fs="italic">
            Note:
          </Text>{" "}
          Model will classify based on target labeling.
          <br />
          Check "Other" to mark unlabeled data and use it in training.
          <br />
          Click and type into the "Other" field to rename the label.
        </Text>
      </Stack>
    </Card>
  );
};
