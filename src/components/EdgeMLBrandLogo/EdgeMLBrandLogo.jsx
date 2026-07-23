import React from "react";
import { Text, Anchor } from "@mantine/core";
import logoSvg from "../../logo.svg";

const EdgeMLBrandLogo = ({ href }) => {
  const isBeta = window.location.host === "edge-ml-beta.dmz.teco.edu";

  return (
    <Anchor
      href={href}
      underline="never"
      className="mt-2"
      style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
    >
      <img
        style={{ marginRight: "8px", width: "32px" }}
        src={logoSvg}
        alt="edge-ml"
      />
      <div>
        <Text fw={700} c="black">
          edge-ml
        </Text>
        {isBeta && (
          <Text ta="right" size="xs" c="red" fw={700}>
            Beta
          </Text>
        )}
      </div>
    </Anchor>
  );
};

export default EdgeMLBrandLogo;
