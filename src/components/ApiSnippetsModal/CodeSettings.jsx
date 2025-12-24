import React from "react";
import { Grid, Group, Radio, Text } from "@mantine/core";

const CodeSettings = (props) => {
  return (
    <Grid>
      <Grid.Col span={{ base: 12, md: 3 }}>
        <Text>Platform:</Text>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 9 }}>
        <Radio.Group
          name="platformCheck"
          value={props.platform}
          onChange={(value) =>
            props.onPlatformChange({ target: { value } })
          }
        >
          <Group justify="space-between">
            <Radio value="Java" label="Java" />
            <Radio value="Node.js" label="Node.js" />
            <Radio value="Javascript" label="Javascript" />
            <Radio value="Arduino" label="Arduino" />
          </Group>
        </Radio.Group>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 3 }}>
        <Text>Use deviceTime:</Text>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 9 }}>
        <Radio.Group
          name="serverTimeCheck"
          value={props.servertime ? "Yes" : "No"}
          onChange={(value) =>
            props.onServerTimeChange({ target: { value } })
          }
        >
          <Group justify="space-between">
            <Radio value="Yes" label="Yes" />
            <Radio value="No" label="No" />
          </Group>
        </Radio.Group>
      </Grid.Col>
    </Grid>
  );
};

export default CodeSettings;
