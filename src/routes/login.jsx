import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  Input,
  InputGroup,
  InputGroupText,
  Button,
  CardBody,
  Col,
  Form,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import {
  faUser,
  faShield,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import EdgeMLBrandLogo from "../components/EdgeMLBrandLogo/EdgeMLBrandLogo";
import useAuth from "../Hooks/useAuth";
import useUserStore from "../Hooks/useUser";

const LoginPage = ({ children }) => {
  const { login, loginOAuth } = useAuth();
  const user = useUserStore((state) => state.user);
  const [email, setEmail] = useState(undefined);
  const [password, setPassword] = useState(undefined);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (error) {
      setTimeout(() => setError(false), 3000);
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

  console.log(user)
  if (user) {
    return children;
  }

  return (
    <div
      onKeyDown={onKeyDown}
      className="vh-100 d-flex justify-content-center align-items-center bg-login"
    >
      <Col xs={11} sm={8} lg={5}>
        <Card>
          <CardHeader className="d-flex justify-content-center">
            <EdgeMLBrandLogo></EdgeMLBrandLogo>
          </CardHeader>
          <CardBody>
            <Form>
              <InputGroup>
                <InputGroupText style={{ background: "#ced4da" }}>
                  <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>
                </InputGroupText>

                <Input
                  type="email"
                  name="email"
                  id="email"
                  placeholder="email or username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </InputGroup>
              <InputGroup>
                <InputGroupText style={{ background: "#ced4da" }}>
                  <FontAwesomeIcon icon={faShield}></FontAwesomeIcon>
                </InputGroupText>
                <Input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
              <Button
                id="login-button"
                outline
                onClick={submit}
                // disabled={this.state.buttonDisabled}
                color="primary"
                block
              >
                Login
              </Button>
              <hr></hr>
              <Button
                color="primary"
                outline
                className="p-1 my-2 w-100 d-flex justify-content-center align-items-center"
                onClick={() => onOAuth("github")}
              >
                <FontAwesomeIcon
                  className="m-1 me-2"
                  size="2x"
                  icon={faGithub}
                ></FontAwesomeIcon>
                <div>Login with Github</div>
              </Button>
            </Form>
            {error ? (
              <div className="mt-3" style={{ color: "red" }}>
                <FontAwesomeIcon icon={faTriangleExclamation}></FontAwesomeIcon>
                Wrong credentials!
              </div>
            ) : null}
            <hr
              style={{
                marginTop: 25,
                marginBottom: 25,
              }}
            />
            Have no account?
            <a href="/register">
              <Button className="mt-2" outline color="secondary" block>
                Register
              </Button>
            </a>
          </CardBody>
        </Card>
      </Col>
    </div>
  );
};

export default LoginPage;
