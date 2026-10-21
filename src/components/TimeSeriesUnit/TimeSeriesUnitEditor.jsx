import React, { useState } from "react";
import { Badge, Button, Group, Input, Popover, Text, Tooltip } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import UnitFields from "./UnitFields";
import { describeUnit } from "./units";
import useUnitCatalog from "../../Hooks/useUnitCatalog";

// Shows a time-series' unit; clicking it opens a form to set or correct the
// quantity and unit. Saving relabels the series, it does not change the
// recorded values. variant "badge" sits next to a heading, "input" lines up
// with form fields (e.g. the CSV upload settings).
const TimeSeriesUnitEditor = ({ timeSeries, onSave, variant = "badge" }) => {
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
          {variant === "input" ? (
            <Input
              component="button"
              type="button"
              size="sm"
              pointer
              onClick={() => (opened ? setOpened(false) : open())}
              aria-label={`Unit of ${timeSeries.name}`}
              rightSection={<FontAwesomeIcon icon={faChevronDown} size="xs" />}
              rightSectionPointerEvents="none"
              styles={{
                input: {
                  textAlign: "left",
                  color: current.convertible ? "var(--mantine-color-blue-7)" : undefined,
                },
              }}
            >
              {current.text ? (
                <>
                  {current.text}
                  {current.quantity && (
                    <Text span size="xs" c="dimmed" ml={6}>
                      {current.quantity}
                    </Text>
                  )}
                </>
              ) : (
                <Text span size="sm" c="dimmed">
                  Set unit
                </Text>
              )}
            </Input>
          ) : (
            <Badge
              size="sm"
              variant={current.text ? "light" : "outline"}
              color={current.convertible ? "blue" : "gray"}
              style={{ cursor: "pointer", textTransform: "none" }}
              onClick={() => (opened ? setOpened(false) : open())}
              aria-label={`Unit of ${timeSeries.name}`}
            >
              {current.text || "Set unit"}
            </Badge>
          )}
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
              {/* Initial focus here: focusing the Quantity select would pop
                  its list open over the Unit field. */}
              <Button size="xs" onClick={save} loading={saving} data-autofocus>
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
