import React from "react";
import { Button, Loader } from "@mantine/core";

function SpinnerButton({
  children,
  loading = false,
  loadingtext = "Loading...",
  ...props
}) {
  return (
    <Button {...props}>
      {loading ? (
        <>
          {loadingtext}
          <Loader size="xs" color="white" ml={4} />
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export default SpinnerButton;
