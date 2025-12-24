import React from "react";
import { Anchor, Box, Group, Text } from "@mantine/core";
import logoSvg from "../../logo.svg";

const EdgeMLBrandLogo = ({ href }) => {
  if (window.location.host === "edge-ml-beta.dmz.teco.edu") {
    return (
      <Anchor href={href} style={{ marginRight: 8, marginTop: 8 }}>
        <Group gap="xs" align="center">
          <img style={{ width: 32 }} src={logoSvg} />
          <Box>
            <Text fw={700} c="black">
              edge-ml
            </Text>
            <Text size="xs" fw={700} c="red" ta="right" style={{ marginTop: -10 }}>
              Beta
            </Text>
          </Box>
        </Group>
      </Anchor>
    );
  }

  return (
    <Anchor href={href} style={{ marginRight: 8, marginTop: 8 }}>
      <Group gap="xs" align="center">
        <img style={{ width: 32 }} src={logoSvg} />
        <Text fw={700} c="black">
          edge-ml
        </Text>
      </Group>
    </Anchor>
  );
};

export default EdgeMLBrandLogo;
