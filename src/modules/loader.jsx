import React from "react";
import { Center } from "@mantine/core";

import LogoLoader from "./LogoLoader";

import "./loader.css";

const Loader = (props) => {
  if (props.loading) {
    return (
      <Center h="100%" w="100%">
        <LogoLoader size={56} />
      </Center>
    );
  }
  return props.children;
};

export default Loader;

export const withLoader = (pred, Wrapped) => {
  const WithLoader = (props) => (
    <Loader loading={!pred(props)}>
      {pred(props) ? <Wrapped {...props} /> : null}
    </Loader>
  );
  WithLoader.displayName = `withLoader(${
    Wrapped.displayName || Wrapped.name || "Component"
  })`;
  return WithLoader;
};
