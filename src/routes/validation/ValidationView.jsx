import React from "react";
import { Box, Card, Container, Title } from "@mantine/core";

export const ValidationView = ({ ongoing, trained }) => {
  return (
    <Container>
      {ongoing ? (
        <Box pt="md">
          <Card>
            <Title order={4}>Ongoing Trainings</Title>
            <Box mt="sm">{ongoing}</Box>
          </Card>
        </Box>
      ) : null}
      {trained}
    </Container>
  );
};
