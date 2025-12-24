import React from "react";
import { Box, Container, Grid, Stack, Text, Title } from "@mantine/core";

export const UploadWebView = ({ sensorList, datasetSettings, graph, fabs }) => {
  return (
    <Container>
      {sensorList || datasetSettings ? (
        <Grid>
          {sensorList ? (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box p="sm">
                <Stack className="header-wrapper" gap={4}>
                  <Title order={4}>Sensor Selection</Title>
                  <Text size="sm">
                    Select sensors you want to record in a dataset.
                  </Text>
                </Stack>
                <Box className="body-wrapper" mt="sm">
                  {sensorList}
                </Box>
              </Box>
            </Grid.Col>
          ) : null}
          {datasetSettings ? (
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Box p="sm">
                <Box className="header-wrapper">
                  <Title order={4}>Dataset Configuration</Title>
                </Box>
                <Box className="body-wrapper" p="md">
                  {datasetSettings}
                </Box>
              </Box>
            </Grid.Col>
          ) : null}
        </Grid>
      ) : null}
      {graph ? (
        <Grid>
          <Grid.Col span={12}>
            <Box p="sm">
              <Box className="header-wrapper">
                <Title order={4}>Data Preview</Title>
              </Box>
              <Box className="body-wrapper" p="md">
                {graph}
              </Box>
            </Box>
          </Grid.Col>
        </Grid>
      ) : null}
      <Box pb="md" />
      <Box pos="fixed" style={{ bottom: "24px", right: "24px" }}>
        {fabs}
      </Box>
    </Container>
  );
};
