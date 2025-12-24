import React from "react";
import { Button } from "@mantine/core";

function SpinnerButton({
  children,
  loading = false,
  loadingtext = "Loading...",
  spinnercolor = "white",
  ...props
}) {
  return (
    <Button
      {...props}
      loading={loading}
      loaderProps={{ color: spinnercolor }}
    >
      {loading ? loadingtext : children}
    </Button>
  );
}

export default SpinnerButton;
