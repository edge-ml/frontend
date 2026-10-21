import React, { useState } from "react";
import { Badge, Button, Group, Popover, Text, Tooltip } from "@mantine/core";
import UnitFields from "./UnitFields";
import { describeUnit } from "./units";
import useUnitCatalog from "../../Hooks/useUnitCatalog";

// Badge showing a time-series' unit; clicking it opens a form to set or
// correct the quantity and unit. Saving relabels the series, it does not
// change the recorded values.
const TimeSeriesUnitEditor = ({ timeSeries, onSave }) => {
  const catalog = useUnitCatalog();
  const [opened, setOpened] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const current = describeUnit(catalog, timeSeries.quantity, timeSeries.unit);

  const open = () => {
    setDraft({ quantity: timeSeries.quantity ?? null, unit: timeSeries.unit ?? "" });
    setError(null);
    setOpened(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(draft.quantity || null, draft.unit.trim());
      setOpened(false);
    } catch (e) {
      setError(e?.message || "Could not save the unit");
    } finally {
      setSaving(false);
    }
  };

  const tooltip = current.convertible
    ? `${current.quantity}, converted automatically for training`
    : current.quantity
      ? `${current.quantity}, not converted`
      : "Unit unknown. Click to set what this time-series measures.";

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      width={260}
      position="bottom-start"
      withArrow
      shadow="md"
      trapFocus
    >
      <Popover.Target>
        <Tooltip label={tooltip} withinPortal openDelay={300} disabled={opened}>
          <Badge
            size="xs"
            variant={current.text ? "light" : "outline"}
            color={current.convertible ? "blue" : "gray"}
            style={{ cursor: "pointer", textTransform: "none" }}
            onClick={() => (opened ? setOpened(false) : open())}
            aria-label={`Unit of ${timeSeries.name}`}
          >
            {current.text || "Set unit"}
          </Badge>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        {draft && catalog ? (
          <>
            <UnitFields catalog={catalog} value={draft} onChange={setDraft} />
            <Text size="xs" c="dimmed" mt="xs">
              This only labels the data; the recorded values stay as they are.
            </Text>
            {error && (
              <Text size="xs" c="red" mt={4}>
                {error}
              </Text>
            )}
            <Group justify="flex-end" gap="xs" mt="sm">
              <Button size="xs" variant="default" onClick={() => setOpened(false)}>
                Cancel
              </Button>
              <Button size="xs" onClick={save} loading={saving}>
                Save
              </Button>
            </Group>
          </>
        ) : (
          <Text size="xs" c="dimmed">
            Loading units…
          </Text>
        )}
      </Popover.Dropdown>
    </Popover>
  );
};

export default TimeSeriesUnitEditor;
