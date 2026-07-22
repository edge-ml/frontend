import React from "react";
import { Radio, Group } from "@mantine/core";

const CodeSettings = (props) => {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ minWidth: "120px" }}>Platform:</span>
        <Radio.Group
          value={props.platform}
          onChange={props.onPlatformChange}
        >
          <Group>
            <Radio value="Java" label="Java" />
            <Radio value="Node.js" label="Node.js" />
            <Radio value="Javascript" label="Javascript" />
            <Radio value="Arduino" label="Arduino" />
          </Group>
        </Radio.Group>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
        <span style={{ minWidth: "120px" }}>Use deviceTime:</span>
        <Radio.Group
          value={props.servertime ? "Yes" : "No"}
          onChange={(val) => props.onServerTimeChange({ target: { value: val } })}
        >
          <Group>
            <Radio value="Yes" label="Yes" />
            <Radio value="No" label="No" />
          </Group>
        </Radio.Group>
      </div>
    </div>
  );
};

export default CodeSettings;
