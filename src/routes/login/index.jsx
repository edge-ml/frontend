import React, { useEffect, useState } from "react";
import {
  Card,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Stack,
  Group,
  Center,
  Alert,
  Divider,
} from "@mantine/core";
import {
  // IconBrandGithub,  // GitHub OAuth temporarily disabled
  IconUser,
  IconShield,
  IconAlertTriangle,
} from "@tabler/icons-react";
import EdgeMLBrandLogo from "../../components/EdgeMLBrandLogo/EdgeMLBrandLogo";
import useAuth from "../../Hooks/useAuth";
import useUserStore from "../../Hooks/useUser";

import "./index.css";

const LoginPage = ({ children }) => {
  const { login, loginOAuth } = useAuth();
  const user = useUserStore((state) => state.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (error) {
      setTimeout(() => setError(""), 5000);
    }
  }, [error]);

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      submit();
    }
  };

  const submit = async () => {
    try {
      await login(email, password);
    } catch (e) {
      setError(e?.message || "Wrong credentials!");
    }
  };

  const onOAuth = async (provider) => {
    try {
      await loginOAuth(provider);
    } catch (e) {
      setError(e?.message || "Wrong credentials!");
    }
  };

  if (user) {
    return children;
  }

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
            Login with credentials
          </Text>

          <TextInput
            leftSection={<IconUser size={16} />}
            placeholder="email or username"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />

          <PasswordInput
            leftSection={<IconShield size={16} />}
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />

          <Button id="login-button" onClick={submit}>
            Login
          </Button>

          {/* GitHub OAuth temporarily disabled
          <Divider />

          <Text size="sm" fw={500}>
            Login with a provider
          </Text>

          <Button
            leftSection={<IconBrandGithub size={20} />}
            onClick={() => onOAuth("github")}
            fullWidth
            color="#24292e"
          >
            <span>
              Login with <b>Github</b>
            </span>
          </Button>

          <Divider />
          */}

          <Divider />

          {error && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <Text size="sm">Have no account?</Text>
          <Button component="a" href="/register" variant="outline" color="gray">
            Register
          </Button>
        </Stack>
      </Card>
    </Center>
  );
};

export default LoginPage;
