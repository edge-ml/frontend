import React from "react";
import { Button, Card, Group, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faMicrochip,
  faMobileScreen,
  faServer,
} from "@fortawesome/free-solid-svg-icons";

// Shown right after the pipeline is picked. Choosing an export target filters the
// options in every later step so the trained model can actually be exported that
// way. Keys must match the values used in the TrainingWizard.
const GOALS = [
  {
    key: "EXECUTORCH",
    icon: faMobileScreen,
    title: "Mobile / smartphone",
    format: "ExecuTorch (.pte)",
    desc: "Runs on Android or iOS. Uses PyTorch models.",
  },
  {
    key: "C",
    icon: faMicrochip,
    title: "Embedded device",
    format: "C code",
    desc: "Runs on microcontrollers and embedded hardware.",
  },
  {
    key: "ONNX",
    icon: faGlobe,
    title: "Browser / JavaScript",
    format: "ONNX",
    desc: "Runs in a web page or Node.js with the edge-ml JavaScript library (onnxruntime-web). Works with the Decision Tree, Random Forest and PyTorch models.",
  },
  {
    key: "PYTORCH",
    icon: faServer,
    title: "Server / research",
    format: "PyTorch (.pt)",
    desc: "Runs in Python on a server or desktop. Works with any PyTorch model, including ones that can't go on-device.",
  },
];

const SelectExportGoal = ({ availableKeys, onSelect, onBack }) => (
  <div className="training-wizard-step">
    <div className="training-wizard-step-header">
      <Text fw={700} size="xl">
        Where will this model run?
      </Text>
      <Text c="dimmed">
        The next steps only offer options that can be exported this way, so
        the trained model can actually be deployed.
      </Text>
    </div>
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      {GOALS.filter((g) => availableKeys.includes(g.key)).map((g) => (
        <Card
          key={g.key}
          withBorder
          radius="md"
          padding="lg"
          className="training-wizard-pipeline-card"
          role="button"
          tabIndex={0}
          aria-label={g.title}
          onClick={() => onSelect(g.key)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelect(g.key);
            }
          }}
        >
          <Group gap="md" align="flex-start" wrap="nowrap">
            <ThemeIcon size={40} radius="md" variant="light">
              <FontAwesomeIcon icon={g.icon} />
            </ThemeIcon>
            <Stack gap={4}>
              <Group gap="xs">
                <Text fw={700} size="lg">
                  {g.title}
                </Text>
                <Text size="xs" c="dimmed" fw={600}>
                  {g.format}
                </Text>
              </Group>
              <Text size="sm" c="dimmed" lh={1.5}>
                {g.desc}
              </Text>
            </Stack>
          </Group>
        </Card>
      ))}
    </SimpleGrid>
    <div>
      <Button variant="default" onClick={onBack}>
        Back to pipeline selection
      </Button>
    </div>
  </div>
);

export default SelectExportGoal;
