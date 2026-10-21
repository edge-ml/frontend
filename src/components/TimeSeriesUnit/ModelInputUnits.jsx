import React from "react";
import { Badge, Group, Text } from "@mantine/core";
import useUnitCatalog from "../../Hooks/useUnitCatalog";
import { describeUnit } from "./units";

// Which unit the model expects for each input, so devices feed matching data.
const ModelInputUnits = ({ model }) => {
  const catalog = useUnitCatalog();
  const inputs =
    model.inputUnits ??
    (model.timeSeries || []).map((name) => ({ name, quantity: null, unit: "" }));

  if (!inputs.length) return null;

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <b>Expected inputs</b>
      {!model.inputUnits && (
        <Text size="xs" c="dimmed">
          This model was trained before units were recorded. Feed values the
          way they were recorded for training.
        </Text>
      )}
      <Group gap={6} mt={4}>
        {inputs.map((inp) => {
          const unit = describeUnit(catalog, inp.quantity, inp.unit);
          return (
            <Badge
              key={inp.name}
              variant="light"
              color={unit.convertible ? "blue" : "gray"}
              style={{ textTransform: "none" }}
            >
              {inp.name}
              {unit.text ? ` · ${unit.text}` : ""}
            </Badge>
          );
        })}
      </Group>
    </div>
  );
};

export default ModelInputUnits;
