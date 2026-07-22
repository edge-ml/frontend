import React from "react";
import {
  Card,
  Container,
  List,
  Text,
} from "@mantine/core";

import { Empty } from "./components/Empty";

export const ExportView = ({
  models,
  selectModel,
  selectedModel,
  detail,
}) => {
  return (
    <Container>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 100%", flexGrow: 0, flexBasis: "33.33%", paddingTop: "1rem" }}>
          <Card shadow="sm" padding="md" radius="md" withBorder style={{ maxHeight: "80vh", textAlign: "left" }}>
            <Card.Section>
              <Text fw={700} size="lg" p="md"><h4>Models</h4></Text>
            </Card.Section>
            <div style={{ overflow: "auto", padding: "1rem" }}>
              {models.length ? (
                <List>
                  {models.map((m) => (
                    <List.Item
                      key={m.id}
                      style={{
                        cursor: "pointer",
                        background: selectedModel && m.id === selectedModel.id ? "#228be6" : "transparent",
                        color: selectedModel && m.id === selectedModel.id ? "#fff" : "inherit",
                        padding: "0.5rem 1rem",
                        borderRadius: "4px",
                      }}
                      onClick={() => selectModel(m.id)}
                    >
                      {m.name}
                    </List.Item>
                  ))}
                </List>
              ) : (
                <Empty>No models available</Empty>
              )}
            </div>
          </Card>
        </div>
        <div style={{ flex: "1 1 66.66%", paddingTop: "1rem" }}>
          <Card shadow="sm" padding="md" radius="md" withBorder style={{ textAlign: "left" }}>
            <Card.Section>
              <Text fw={700} size="lg" p="md"><h4>Deployment</h4></Text>
            </Card.Section>
            <div style={{ padding: "1rem" }}>{detail}</div>
          </Card>
        </div>
      </div>
    </Container>
  );
};
