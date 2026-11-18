import React, { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Collapse,
  Group,
  NumberInput,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

// What to import from a WHAR dataset. `value` is
// { channels: string[], activities: string[], samplingFreq: number }.
export const defaultSettings = (dataset) => ({
  channels: dataset?.channels ?? [],
  activities: dataset?.activities ?? [],
  samplingFreq: dataset?.default_sampling_freq ?? dataset?.sampling_freq ?? undefined,
});

// The request body for the settings: only what differs from the defaults,
// so an import without changes sends what it always sent.
export const settingsToRequest = (dataset, settings) => {
  const body = {};
  const all = (chosen, available) =>
    chosen.length === available.length && available.every((v) => chosen.includes(v));
  if (dataset.channels?.length && !all(settings.channels, dataset.channels)) {
    body.channels = settings.channels;
  }
  if (dataset.activities?.length && !all(settings.activities, dataset.activities)) {
    body.activities = settings.activities;
  }
  const rate = Number(settings.samplingFreq);
  const defaultRate = dataset.default_sampling_freq ?? dataset.sampling_freq;
  if (Number.isFinite(rate) && rate > 0 && rate !== defaultRate) {
    body.sampling_freq = rate;
  }
  return body;
};

export const settingsProblem = (settings) => {
  if (settings.channels.length === 0) return "Choose at least one channel.";
  if (settings.activities.length === 0) return "Choose at least one activity.";
  const rate = Number(settings.samplingFreq);
  if (!Number.isFinite(rate) || rate <= 0 || rate > 1000) {
    return "The sampling rate must be between 0 and 1000 Hz.";
  }
  return undefined;
};

// A searchable list of names to tick, for channels and activities.
const NamePicker = ({ label, names, chosen, onChange }) => {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const shown = query ? names.filter((n) => n.toLowerCase().includes(query)) : names;
  const chosenSet = useMemo(() => new Set(chosen), [chosen]);
  const toggle = (name) =>
    onChange(
      chosenSet.has(name)
        ? chosen.filter((n) => n !== name)
        : names.filter((n) => chosenSet.has(n) || n === name)
    );
  const setShown = (on) => {
    const shownSet = new Set(shown);
    onChange(names.filter((n) => (shownSet.has(n) ? on : chosenSet.has(n))));
  };

  return (
    <Stack gap={6}>
      <Group justify="space-between" gap="xs" wrap="nowrap">
        <Text size="sm" fw={600}>
          {label}{" "}
          <Text span size="xs" c="dimmed" fw={400}>
            {chosen.length} of {names.length}
          </Text>
        </Text>
        <Group gap={4} wrap="nowrap">
          {names.length > 8 ? (
            <TextInput
              size="xs"
              w={160}
              placeholder={`Search ${label.toLowerCase()}`}
              aria-label={`Search ${label.toLowerCase()}`}
              leftSection={<FontAwesomeIcon icon={faMagnifyingGlass} size="xs" />}
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
            />
          ) : null}
          <Button size="compact-xs" variant="subtle" onClick={() => setShown(true)}>
            {query ? "Tick shown" : "All"}
          </Button>
          <Button size="compact-xs" variant="subtle" color="gray" onClick={() => setShown(false)}>
            {query ? "Untick shown" : "None"}
          </Button>
        </Group>
      </Group>
      <ScrollArea.Autosize mah={170} type="auto">
        <SimpleGrid cols={{ base: 1, xs: 2, sm: 3 }} spacing={4} verticalSpacing={4}>
          {shown.map((name) => (
            <Checkbox
              key={name}
              size="xs"
              label={name}
              checked={chosenSet.has(name)}
              onChange={() => toggle(name)}
              styles={{ label: { wordBreak: "break-all" } }}
            />
          ))}
        </SimpleGrid>
        {shown.length === 0 ? (
          <Text size="xs" c="dimmed">
            Nothing matches.
          </Text>
        ) : null}
      </ScrollArea.Autosize>
    </Stack>
  );
};

const WharImportSettings = ({ dataset, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const defaultRate = dataset.default_sampling_freq ?? dataset.sampling_freq;
  const summary = [
    value.channels.length === dataset.channels.length
      ? "all channels"
      : `${value.channels.length} of ${dataset.channels.length} channels`,
    value.activities.length === dataset.activities.length
      ? "all activities"
      : `${value.activities.length} of ${dataset.activities.length} activities`,
    `${value.samplingFreq ?? "?"} Hz`,
  ].join(" · ");

  return (
    <Paper withBorder radius="md" p="sm" mt="md">
      <UnstyledButton
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{ width: "100%" }}
      >
        <Group gap="xs" wrap="nowrap">
          <FontAwesomeIcon icon={open ? faChevronDown : faChevronRight} size="xs" />
          <Text size="sm" fw={700}>
            Import settings for {dataset.name}
          </Text>
          <Text size="xs" c="dimmed" truncate="end">
            {summary}
          </Text>
        </Group>
      </UnstyledButton>
      <Collapse in={open}>
        <Stack gap="md" mt="sm">
          <NamePicker
            label="Channels"
            names={dataset.channels}
            chosen={value.channels}
            onChange={(channels) => onChange({ ...value, channels })}
          />
          <NamePicker
            label="Activities"
            names={dataset.activities}
            chosen={value.activities}
            onChange={(activities) => onChange({ ...value, activities })}
          />
          <NumberInput
            size="xs"
            w={220}
            label="Sampling rate (Hz)"
            description={
              dataset.sampling_freq
                ? `Recorded at ${dataset.sampling_freq} Hz`
                : `Recorded at different rates; ${defaultRate} Hz by default`
            }
            min={1}
            max={1000}
            decimalScale={2}
            value={value.samplingFreq ?? ""}
            onChange={(samplingFreq) =>
              onChange({ ...value, samplingFreq: samplingFreq === "" ? undefined : Number(samplingFreq) })
            }
          />
          <Text size="xs" c="dimmed">
            Only sessions of the ticked activities are imported, and subjects
            without any are left out. All data is resampled to the rate above.
          </Text>
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default WharImportSettings;
