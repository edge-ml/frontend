import React from "react";
import { Button, Loader } from "@mantine/core";

function SpinnerButton({
  children,
  loading = false,
  loadingtext = "Loading...",
  disabled = false,
  ...props
}) {
  return (
    <Button {...props} disabled={disabled || loading}>
      {loading ? (
        <>
          {loadingtext}
          <Loader size="xs" color="currentColor" ml={4} />
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export default SpinnerButton;
