import React, { useState } from "react";
import {
  Anchor,
  Box,
  Button,
  Checkbox,
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
import {
  faEnvelope,
  faExclamationTriangle,
  faShield,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import EdgeMLBrandLogo from "../components/EdgeMLBrandLogo/EdgeMLBrandLogo";
import useRegister from "../Hooks/useRegister";

const RegisterPage = () => {
  const [error, setError] = useState("");

  const register = useRegister();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      passwordRepeat: "",
      username: "",
      acceptTerms: false,
    },
    validate: {
      email: (value) => (value ? null : "Email is required"),
      password: (value) => (value ? null : "Password is required"),
      passwordRepeat: (value, values) =>
        value
          ? value === values.password
            ? null
            : "Passwords do not match"
          : "Repeat password is required",
      username: (value) => (value ? null : "Username is required"),
      acceptTerms: (value) => (value ? null : "You must accept the terms"),
    },
  });

  const onRegisterClick = async (values) => {
    try {
      await register(
        values.username,
        values.email,
        values.password,
        values.passwordRepeat
      );
    } catch (e) {
      setError(e.message || "Registration failed");
    }
  };

  return (
    <Box className="vh-100 d-flex justify-content-center align-items-center bg-login">
      <Container size={420} w="100%">
        <Paper shadow="md" radius="md" p="xl">
          <Group justify="center" mb="md">
            <EdgeMLBrandLogo />
          </Group>
          <form onSubmit={form.onSubmit(onRegisterClick)}>
            <Stack gap="md">
              <TextInput
                type="email"
                name="email"
                id="email"
                placeholder="email"
                leftSection={<FontAwesomeIcon icon={faEnvelope} />}
                leftSectionPointerEvents="none"
                {...form.getInputProps("email")}
              />
              <PasswordInput
                name="password"
                id="password"
                placeholder="password"
                leftSection={<FontAwesomeIcon icon={faShield} />}
                leftSectionPointerEvents="none"
                {...form.getInputProps("password")}
              />
              <PasswordInput
                name="passwordRepeat"
                id="passwordRepeat"
                placeholder="repeat password"
                leftSection={<FontAwesomeIcon icon={faShield} />}
                leftSectionPointerEvents="none"
                {...form.getInputProps("passwordRepeat")}
              />
              <TextInput
                name="username"
                id="username"
                placeholder="username"
                leftSection={<FontAwesomeIcon icon={faUser} />}
                leftSectionPointerEvents="none"
                {...form.getInputProps("username")}
              />
              <Checkbox
                id="termsCheckbox"
                label={
                  <>
                    I have read and agree to the{" "}
                    <Anchor
                      href="/terms_of_service.html"
                      target="_blank"
                      rel="noreferrer"
                    >
                      terms of service
                    </Anchor>
                    .
                  </>
                }
                {...form.getInputProps("acceptTerms", { type: "checkbox" })}
              />
              {error ? (
                <Group gap="xs" style={{ color: "red" }}>
                  <FontAwesomeIcon
                    style={{ color: "red" }}
                    icon={faExclamationTriangle}
                    className="me-2 fa-xs"
                    data-tip="Error"
                    id="errorIcon"
                  />
                  <Text size="sm" c="red">
                    {error}
                  </Text>
                </Group>
              ) : null}
              <Button
                id="registerButton"
                color="green"
                type="submit"
                disabled={!form.values.acceptTerms}
              >
                Register
              </Button>
              <Divider />
              <Text>
                Login instead? <Anchor href="/login">Click here!</Anchor>
              </Text>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
