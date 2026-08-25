import React, { useState } from "react";
import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Stack,
  Center,
  Checkbox,
  Alert,
  Divider,
} from "@mantine/core";
import {
  IconMail,
  IconShield,
  IconUser,
  IconAlertTriangle,
} from "@tabler/icons-react";
import EdgeMLBrandLogo from "../components/EdgeMLBrandLogo/EdgeMLBrandLogo";
import useRegister from "../Hooks/useRegister";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [userName, setUserName] = useState("");
  const [ToS_accepted, setToS_accepted] = useState(false);
  const [error, setError] = useState("");

  const register = useRegister();

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      onRegisterClick();
    }
  };

  const onRegisterClick = async () => {
    try {
      await register(userName, email, password, passwordRepeat);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Center h="100vh" bg="gray.1">
      <Card
        shadow="md"
        padding="lg"
        radius="md"
        withBorder
        maw={450}
        w="100%"
        mx="auto"
        onKeyDown={onKeyDown}
      >
        <Card.Section p="lg">
          <Center>
            <EdgeMLBrandLogo />
          </Center>
        </Card.Section>

        <Stack gap="md">
          <Text size="sm" fw={500}>
            Register with credentials
          </Text>

          <TextInput
            leftSection={<IconUser size={16} />}
            placeholder="username"
            value={userName}
            onChange={(e) => setUserName(e.currentTarget.value)}
          />

          <TextInput
            leftSection={<IconMail size={16} />}
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />

          <PasswordInput
            leftSection={<IconShield size={16} />}
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />

          <PasswordInput
            leftSection={<IconShield size={16} />}
            placeholder="repeat password"
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.currentTarget.value)}
          />

          <Checkbox
            label={
              <Text size="sm">
                I have read and agree to the{" "}
                <a href="/terms_of_service.html" target="_blank">
                  terms of service
                </a>
                .
              </Text>
            }
            checked={ToS_accepted}
            onChange={() => setToS_accepted(!ToS_accepted)}
          />

          <Button
            id="registerButton"
            onClick={onRegisterClick}
            disabled={!ToS_accepted}
          >
            Register
          </Button>

          {error && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <Divider />

          <Text size="sm">Already have an account?</Text>
          <Button component="a" href="/login" variant="outline" color="gray">
            Login
          </Button>
        </Stack>
      </Card>
    </Center>
  );
};

export default RegisterPage;
