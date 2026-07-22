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
} from "@mantine/core";
import {
  IconMail,
  IconShield,
  IconUser,
  IconAlertTriangle,
} from "@tabler/icons-react";
import EdgeMLBrandLogo from "../components/EdgeMLBrandLogo/EdgeMLBrandLogo";
import { useNavigate } from "react-router-dom";
import useRegister from "../Hooks/useRegister";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [userName, setUserName] = useState("");
  const [ToS_accepted, setToS_accepted] = useState(false);
  const [error, setError] = useState("");

  const register = useRegister();

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
      >
        <Card.Section p="lg">
          <Center>
            <EdgeMLBrandLogo />
          </Center>
        </Card.Section>

        <Stack gap="md">
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

          <TextInput
            leftSection={<IconUser size={16} />}
            placeholder="username"
            value={userName}
            onChange={(e) => setUserName(e.currentTarget.value)}
          />

          <Checkbox
            label={
              <Text size="sm">
                I have read and agree to the{" "}
                <a href="/terms_of_service.html" target="_blank">
                  terms of service
                </a>.
              </Text>
            }
            checked={ToS_accepted}
            onChange={() => setToS_accepted(!ToS_accepted)}
          />

          {error && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <Button
            id="registerButton"
            color="green"
            onClick={onRegisterClick}
            disabled={!ToS_accepted}
          >
            Register
          </Button>

          <Text size="sm">
            Login instead? <a href="/login">Click here!</a>
          </Text>
        </Stack>
      </Card>
    </Center>
  );
};

export default RegisterPage;
