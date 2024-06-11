import React, { useState } from "react";
import {
  Col,
  Row,
  Input,
  InputGroup,
  InputGroupText,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormGroup,
  Label,
} from "reactstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faExclamationTriangle,
  faShield,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
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

  const onEMailChanged = (e) => {
    setEmail(e.target.value);
  };

  const onPasswordChanged = (e) => {
    setPassword(e.target.value);
  };

  const onPasswordRepeatChanged = (e) => {
    setPasswordRepeat(e.target.value);
  };

  const onUserNameChanged = (e) => {
    setUserName(e.target.value);
  };

  const onToS_checked = () => {
    setToS_accepted(!ToS_accepted);
  };

  const onRegisterClick = async () => {
    try {
      await register(userName, email, password, passwordRepeat);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-login">
      <Col xs={11} sm={8} lg={5}>
        <Card>
          <CardHeader
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EdgeMLBrandLogo />
          </CardHeader>
          <CardBody>
            <Row>
              <Col>
                <Col>
                  <InputGroup>
                    <InputGroupText>
                      <FontAwesomeIcon icon={faEnvelope} />
                    </InputGroupText>
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="email"
                      onChange={onEMailChanged}
                    />
                  </InputGroup>
                </Col>
                <Col>
                  <InputGroup>
                    <InputGroupText>
                      <FontAwesomeIcon icon={faShield} />
                    </InputGroupText>
                    <Input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="password"
                      onChange={onPasswordChanged}
                    />
                  </InputGroup>
                </Col>
                <Col>
                  <InputGroup>
                    <InputGroupText>
                      <FontAwesomeIcon icon={faShield} />
                    </InputGroupText>
                    <Input
                      type="password"
                      name="passwordRepeat"
                      id="passwordRepeat"
                      placeholder="repeat password"
                      onChange={onPasswordRepeatChanged}
                    />
                  </InputGroup>
                </Col>
                <Col>
                  <InputGroup>
                    <InputGroupText>
                      <FontAwesomeIcon icon={faUser} />
                    </InputGroupText>
                    <Input
                      type="text"
                      name="username"
                      id="username"
                      placeholder="username"
                      onChange={onUserNameChanged}
                    />
                  </InputGroup>
                </Col>
                <Col style={{ paddingBottom: "10px", textAlign: "left" }}>
                  <FormGroup check style={{ marginTop: 20, marginBottom: 10 }}>
                    <Label check>
                      <Input
                        type="checkbox"
                        onChange={onToS_checked}
                        id="termsCheckbox"
                      />{" "}
                      I have read and agree to the{" "}
                      <a href="/terms_of_service.html" target="_blank">
                        terms of service
                      </a>
                      .
                    </Label>
                  </FormGroup>
                </Col>
                {error ? (
                  <Col
                    className="my-1"
                    style={{ paddingRight: "15px", paddingLeft: "15px" }}
                  >
                    <FontAwesomeIcon
                      style={{ color: "red" }}
                      icon={faExclamationTriangle}
                      className="me-2 fa-xs"
                      data-tip="Error"
                      id="errorIcon"
                    />
                    <div style={{ color: "red", display: "inline-block" }}>
                      {error}
                    </div>
                  </Col>
                ) : null}
                <Col>
                  <Button
                    id="registerButton"
                    color="success"
                    block
                    onClick={onRegisterClick}
                    disabled={!ToS_accepted}
                    style={{ marginBottom: 10 }}
                  >
                    Register
                  </Button>
                  <hr />
                  <div>
                    <span>Login instead? </span>
                    <a href="/login">Click here!</a>
                  </div>
                </Col>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    </div>
  );
};

export default RegisterPage;
