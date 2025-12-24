import React from "react";
import { Box, Button, Divider, Group, Select, Stack, Text } from "@mantine/core";
import { platforms } from "./platforms";
import { Line } from "./components/Line";

export const ExportDetailView = ({
  model, // { name: string } // later platforms

  onClickViewModelDetails,
  onClickDownloadModel,
  platformName,
  platformContents,
  onPlatform,
}) => {
  const nPlatforms = model.platforms
    .map((v) => platforms.find((p) => p.value === v))
    .filter((v) => v);
  const nPlatform = nPlatforms.find((p) => p.value === platformName);
  const Code = nPlatform ? nPlatform.prism : null;

  return (
    <Stack>
      <Line>
        <Group justify="space-between" align="center">
          <Text fw={700}>Model name:</Text>
          <Text>{model.name}</Text>
          <Button onClick={onClickViewModelDetails}>See Model Details</Button>
        </Group>
      </Line>
      <Line>
        <Text fw={700}>Available on platforms:</Text>
        <Box component="ul" style={{ margin: 0, paddingLeft: "1.25rem" }}>
          {nPlatforms.map((p) => (
            <li key={p.value}>
              <Text>{p.label}</Text>
            </li>
          ))}
        </Box>
      </Line>

      {nPlatform ? (
        <>
          <Divider />
          <Line>
            <Text fw={700} size="lg">
              Export model
            </Text>
          </Line>
          <Line>
            <Group justify="space-between" align="center" wrap="wrap">
              <Text fw={700}>Platform:</Text>
              <Group gap="sm" align="center">
                <Select
                  value={nPlatform.value}
                  onChange={(value) => onPlatform(value)}
                  data={nPlatforms.map((p) => ({
                    value: p.value,
                    label: p.label,
                  }))}
                  w={200}
                />
                <Button onClick={onClickDownloadModel}>Download model</Button>
              </Group>
            </Group>
          </Line>
          <Line>
            <Text fw={700}>Code:</Text>
            <Code code={platformContents} />
          </Line>
        </>
      ) : null}
    </Stack>
  );
};
