import React from "react";
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  ScrollArea,
  Stack,
  Title,
} from "@mantine/core";

import { Empty } from "./components/Empty";

export const ExportView = ({
  models, // {id: string, name: string, creation_date: number}[]
  selectModel,
  selectedModel,

  detail,
}) => {
  return (
    <Container>
      <Grid>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Card style={{ maxHeight: "80vh" }}>
            <Title order={4}>Models</Title>
            <ScrollArea h="70vh" mt="sm">
              {models.length ? (
                <Stack gap="xs">
                  {models.map((m) => {
                    const isActive = selectedModel && m.id === selectedModel.id;
                    return (
                      <Button
                        key={m.id}
                        variant={isActive ? "filled" : "light"}
                        color="blue"
                        onClick={() => selectModel(m.id)}
                        justify="flex-start"
                      >
                        {m.name}
                      </Button>
                    );
                  })}
                </Stack>
              ) : (
                <Empty>No models available</Empty>
              )}
            </ScrollArea>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Card>
            <Title order={4}>Deployment</Title>
            <Box mt="sm">{detail}</Box>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  );
};
