import React from "react";
import { Center, Loader as MantineLoader } from "@mantine/core";

import "./loader.css";

const Loader = (props) => {
  if (props.loading) {
    return (
      <Center h="100%" w="100%">
        <MantineLoader className="loader" color="blue" />
      </Center>
    );
  } else {
    return props.children;
  }
};

export default Loader;

export const withLoader = (pred, Wrapped) => (props) => (
  <Loader loading={!pred(props)}>
    {pred(props) ? <Wrapped {...props} /> : null}
  </Loader>
);
