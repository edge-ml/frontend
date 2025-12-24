import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  faUser,
  faShield,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import EdgeMLBrandLogo from "../../components/EdgeMLBrandLogo/EdgeMLBrandLogo";
import useAuth from "../../Hooks/useAuth";
import useUserStore from "../../Hooks/useUser";

import "./index.css"

const LoginPage = ({ children }) => {
  const { login, loginOAuth } = useAuth();
  const user = useUserStore((state) => state.user);
  const [error, setError] = useState(false);

  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: (value) => (value ? null : "Username is required"),
      password: (value) => (value ? null : "Password is required"),
    },
  });

  useEffect(() => {
    if (error) {
      setTimeout(() => setError(false), 3000);
    }
  }, [error]);

  const submit = async (values) => {
    try {
      await login(values.username, values.password);
    } catch {
      setError(true);
    }
  };

  const onOAuth = async (provider) => {
    try {
      const res = await loginOAuth(provider);
    } catch {
      setError(true);
    }
  };

  if (user) {
    return children;
  }

  return (
    <Box className="vh-100 d-flex justify-content-center align-items-center bg-login">
      <Container size={420} w="100%">
        <Paper shadow="md" radius="md" p="xl">
          <Group justify="center" mb="md">
            <EdgeMLBrandLogo></EdgeMLBrandLogo>
          </Group>
          <form onSubmit={form.onSubmit(submit)}>
            <Stack gap="md">
              <Text fw={600}>Login with credentials</Text>
              <TextInput
                name="username"
                id="username"
                placeholder="username"
                leftSection={<FontAwesomeIcon icon={faUser} />}
                leftSectionPointerEvents="none"
                {...form.getInputProps("username")}
              />
              <PasswordInput
                name="password"
                id="password"
                placeholder="password"
                leftSection={<FontAwesomeIcon icon={faShield} />}
                leftSectionPointerEvents="none"
                {...form.getInputProps("password")}
              />
              <Button id="login-button" variant="outline" type="submit" fullWidth>
                <b>Login</b>
              </Button>
              {/* <Divider />
              <Text fw={600}>Login with a provider</Text>
              <Button
                className="btnGithub"
                onClick={() => onOAuth("github")}
                leftSection={<FontAwesomeIcon size="lg" icon={faGithub} />}
                fullWidth
              >
                Login with <b>Github</b>
              </Button> */}
            </Stack>
          </form>
          {error ? (
            <Group mt="md" gap="xs" style={{ color: "red" }}>
              <FontAwesomeIcon icon={faTriangleExclamation}></FontAwesomeIcon>
              <Text size="sm" c="red">
                Wrong credentials!
              </Text>
            </Group>
          ) : null}
          <Divider my="md" />
          <Text>Have no account?</Text>
          <Button
            className="mt-2"
            component="a"
            href="/register"
            variant="outline"
            color="gray"
            fullWidth
          >
            <b>Register</b>
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
