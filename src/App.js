import React, { Component } from 'react';
import {
  Container,
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  Button,
  Form
} from 'reactstrap';
import { Route, Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './App.css';

import AuthWall from './routes/login';
import ListPage from './routes/list';
import DatasetPage from './routes/dataset';

import logo from './logo.png';

class App extends Component {
  constructor(props) {
    super(props);
    this.logoutHandler = this.logoutHandler.bind(this);
  }

  logoutHandler(e) {
    e.preventDefault();
    window.localStorage.clear();
    window.location.reload();
  }

  render() {
    return (
      <AuthWall>
        <Navbar color="light" light expand="md">
          <NavbarBrand>Explorer</NavbarBrand>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <Link className="nav-link" to="/list">
                Datasets
              </Link>
            </NavItem>
            <NavItem>
              <Link className="nav-link" to="/">
                Labelings
              </Link>
            </NavItem>
            <Form className="form-inline my-2 my-lg-0">
              <Link
                className="nav-link m-0 p-0 ml-3"
                to="/"
                onClick={this.logoutHandler}
              >
                <Button className="m-0 my-2 my-sm-0" outline>
                  Logout
                </Button>
              </Link>
            </Form>
            <NavItem />
          </Nav>
        </Navbar>
        <Container>
          <Route exact path="/list" component={ListPage} />
          <Route exact path="/" component={ListPage} />
          <Route path="/dataset/:id" component={DatasetPage} />
        </Container>
      </AuthWall>
    );
  }
}

export default App;
