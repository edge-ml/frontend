import React, { useState } from "react";
import { Select, Stack, TextInput } from "@mantine/core";
import { findQuantity, findUnit } from "./units";

const UNKNOWN = "__unknown";
const CUSTOM = "__custom";

const initialMode = (catalog, quantity) => {
  if (!quantity) return UNKNOWN;
  return findQuantity(catalog, quantity) ? quantity : CUSTOM;
};

// Quantity + unit inputs. value/onChange use { quantity, unit } with quantity
// null when unknown. Built-in quantities offer their catalog units (converted
// automatically) or a free label (not converted).
const UnitFields = ({ catalog, value, onChange, size = "xs" }) => {
  const [mode, setMode] = useState(() => initialMode(catalog, value.quantity));
  const quantity = findQuantity(catalog, mode);
  const [customUnit, setCustomUnit] = useState(
    () => Boolean(quantity) && !findUnit(quantity, value.unit)
  );

  const onQuantityChange = (next) => {
    setMode(next);
    setCustomUnit(false);
    if (next === UNKNOWN) {
      onChange({ quantity: null, unit: value.unit });
    } else if (next === CUSTOM) {
      onChange({ quantity: "", unit: value.unit });
    } else {
      const q = findQuantity(catalog, next);
      // Keep the current unit when it is valid for the new quantity.
      const unit = findUnit(q, value.unit)?.id ?? q.defaultUnit;
      onChange({ quantity: next, unit });
    }
  };

  const onUnitChoice = (next) => {
    if (next === CUSTOM) {
      setCustomUnit(true);
      onChange({ ...value, unit: "" });
    } else {
      setCustomUnit(false);
      onChange({ ...value, unit: next });
    }
  };

  const quantityOptions = [
    { value: UNKNOWN, label: "Unknown" },
    ...(catalog?.quantities ?? []).map((q) => ({ value: q.id, label: q.label })),
    { value: CUSTOM, label: "Custom quantity…" },
  ];

  return (
    <Stack gap={6}>
      <Select
        size={size}
        label="Quantity"
        data={quantityOptions}
        value={mode}
        onChange={(v) => v && onQuantityChange(v)}
        searchable
        allowDeselect={false}
        comboboxProps={{ withinPortal: false }}
      />
      {mode === CUSTOM && (
        <TextInput
          size={size}
          label="Quantity name"
          placeholder="e.g. strain"
          value={value.quantity ?? ""}
          onChange={(e) => onChange({ ...value, quantity: e.currentTarget.value })}
        />
      )}
      {quantity && (
        <Select
          size={size}
          label="Unit"
          data={[
            ...quantity.units.map((u) => ({ value: u.id, label: u.label })),
            { value: CUSTOM, label: "Other (not converted)…" },
          ]}
          value={customUnit ? CUSTOM : findUnit(quantity, value.unit)?.id ?? null}
          onChange={(v) => v && onUnitChoice(v)}
          allowDeselect={false}
          comboboxProps={{ withinPortal: false }}
        />
      )}
      {(!quantity || customUnit) && (
        <TextInput
          size={size}
          label={quantity ? "Unit label" : "Unit"}
          placeholder={mode === UNKNOWN ? "optional, e.g. raw" : "e.g. µε"}
          value={value.unit ?? ""}
          onChange={(e) => onChange({ ...value, unit: e.currentTarget.value })}
        />
      )}
    </Stack>
  );
};

export default UnitFields;
