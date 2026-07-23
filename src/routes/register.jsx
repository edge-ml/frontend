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
  IconBrandGithub,
} from "@tabler/icons-react";
import EdgeMLBrandLogo from "../components/EdgeMLBrandLogo/EdgeMLBrandLogo";
import { useNavigate } from "react-router-dom";
import useRegister from "../Hooks/useRegister";
import useAuth from "../Hooks/useAuth";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [userName, setUserName] = useState("");
  const [ToS_accepted, setToS_accepted] = useState(false);
  const [error, setError] = useState("");

  const register = useRegister();
  const { loginOAuth } = useAuth();

  const onRegisterClick = async () => {
    try {
      await register(userName, email, password, passwordRepeat);
    } catch (e) {
      setError(e.message);
    }
  };

  const onOAuth = async (provider) => {
    try {
      await loginOAuth(provider);
    } catch (e) {
      setError(e?.message || "OAuth login failed");
    }
  };

  return (
    <Center
      h="100vh"
      style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}
    >
      <Card
        shadow="lg"
        padding="xl"
        radius="lg"
        withBorder
        maw={450}
        w="100%"
        mx="auto"
        style={{ backdropFilter: "blur(8px)", background: "rgba(255, 255, 255, 0.98)" }}
      >
        <Card.Section p="xl" pb={0}>
          <Center>
            <EdgeMLBrandLogo />
          </Center>
          <Text ta="center" c="dimmed" size="sm" mt="xs">
            Create your account
          </Text>
        </Card.Section>

        <Stack gap="md" mt="lg">
          <Text size="sm" fw={600} tt="uppercase" c="dimmed">
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
            fullWidth
            size="md"
          >
            Register
          </Button>

          <Divider label="or" labelPosition="center" my="sm" />

          <Text size="sm" fw={600} tt="uppercase" c="dimmed">
            Register with a provider
          </Text>

          <Button
            leftSection={<IconBrandGithub size={20} />}
            onClick={() => onOAuth("github")}
            fullWidth
            size="md"
            color="#24292e"
          >
            <span>
              Register with <b>Github</b>
            </span>
          </Button>

          <Text ta="center" size="sm" c="dimmed" mt="xs">
            Already have an account?{" "}
            <Text
              component="a"
              href="/login"
              c="blue"
              td="underline"
              style={{ cursor: "pointer" }}
            >
              Login
            </Text>
          </Text>
        </Stack>
      </Card>
    </Center>
  );
};

export default RegisterPage;
