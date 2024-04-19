import { useContext, useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Button,
  CardBody,
  Col,
} from 'reactstrap';
import jwt_decode from 'jwt-decode';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faShield } from '@fortawesome/free-solid-svg-icons';
import EdgeMLBrandLogo from '../components/EdgeMLBrandLogo/EdgeMLBrandLogo';
import {
  getAccessToken,
  getRefreshToken,
  setToken,
} from '../services/LocalStorageService';
import { loginUser } from '../services/ApiServices/AuthentificationServices';
import { AuthContext } from '../AuthProvider';

const LoginPage = ({ children }) => {
  const { user, setUser } = useContext(AuthContext);

  // const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [email, setEmail] = useState(undefined);
  const [password, setPassword] = useState(undefined);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (accessToken) {
      const decoded = jwt_decode(accessToken);
      if (decoded.exp * 1000 >= Date.now()) {
        setUser(decoded.email, decoded.userName);
      }
    }
  };

  const submit = async () => {
    try {
      const userData = await loginUser(email, password);
      const decoded = jwt_decode(userData.access_token);
      setToken(userData.access_token, userData.refresh_token);
      setUser(decoded.email, decoded.userName);
    } catch {
      console.log('ERROR loggin in!');
    }
  };

  if (user) {
    return children;
  }

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-login">
      <Col xs={11} sm={8} lg={5}>
        <Card>
          <CardHeader className="d-flex justify-content-center">
            <EdgeMLBrandLogo></EdgeMLBrandLogo>
          </CardHeader>
          <CardBody>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText style={{ background: '#ced4da' }}>
                  <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>
                </InputGroupText>
              </InputGroupAddon>

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
              <InputGroupAddon addonType="prepend">
                <InputGroupText style={{ background: '#ced4da' }}>
                  <FontAwesomeIcon icon={faShield}></FontAwesomeIcon>
                </InputGroupText>
              </InputGroupAddon>
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
              onClick={submit}
              // disabled={this.state.buttonDisabled}
              color="primary"
              block
              className="btn-success"
            >
              Login
            </Button>
            <hr
              style={{
                marginTop: 25,
                marginBottom: 25,
              }}
            />
            Have no account?
            <a href="/register">
              <Button
                color="secondary"
                style={{
                  marginTop: 10,
                }}
                block
              >
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
