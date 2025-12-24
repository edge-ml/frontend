import React, { Fragment } from "react";
import { Box, Group, Paper } from "@mantine/core";

import "./index.css";

const EdgeMLTable = ({ children, className, style }) => {
  const header = React.Children.toArray(children).find(
    (child) => child.type === EdgeMLTableHeader
  );
  const body = React.Children.toArray(children)
    .filter((elm) => elm.type !== EdgeMLTableHeader)
    .map((child, index) => {
      return React.cloneElement(child, { index: index });
    });

  return (
    <Box style={{ ...style }} className={className}>
      <Group className="table-header-wrapper mt-3" align="center">
        {header}
      </Group>
      <Box className="table-body-wrapper">{body}</Box>
    </Box>
  );
};

const EdgeMLTableHeader = ({ children }) => {
  return <>{children}</>;
};

const EdgeMLTableEntry = ({ children, index, className }) => {
  return (
    <Fragment>
      <Paper
        className={"datasetCard " + className}
        radius={0}
        withBorder={false}
        style={{
          background: index % 2 === 1 ? "rgb(249, 251, 252)" : "",
        }}
      >
        {children}
      </Paper>
    </Fragment>
  );
};

export { EdgeMLTable, EdgeMLTableHeader, EdgeMLTableEntry };
