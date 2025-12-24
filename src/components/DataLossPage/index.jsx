import { useState, useEffect } from "react";
import { Box, Button, Center, Stack, Text, Title } from "@mantine/core";
import logoSvg from "../../logo.svg";

const DataLossPage = ({ children }) => {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const lastAcceptanceDate = localStorage.getItem("lastAcceptanceDate");
    if (lastAcceptanceDate) {
      const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;
      const currentDate = new Date();
      const lastAcceptance = new Date(lastAcceptanceDate);
      if (currentDate - lastAcceptance < oneWeekInMilliseconds) {
        setAccepted(true);
      }
    }
  }, []);

  const acceptDataLoss = () => {
    localStorage.setItem("lastAcceptanceDate", new Date().toISOString());
    setAccepted(true);
  };

  if (accepted) {
    return children;
  }

  return (
    <>
      {children}
      <Box
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10000,
          backgroundColor: "rgba(255,255,255,0.9)",
        }}
      >
        <Center h="100vh" w="100vw">
          <Stack align="center" gap="lg">
            <Center>
              <img
                style={{ marginRight: 8, width: 100 }}
                src={logoSvg}
                alt="Logo"
              />
              <Title order={2} c="black">
                edge-ml
              </Title>
            </Center>
            <Text size="xl" ta="center">
              This is an edge-ml beta deployment.
            </Text>
            <Text size="xl" ta="center">
              Data, including your account, may get deleted at any time.
            </Text>
            <Button size="lg" onClick={acceptDataLoss}>
              Accept
            </Button>
          </Stack>
        </Center>
      </Box>
    </>
  );
};

export default DataLossPage;
