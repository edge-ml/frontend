import React, { Component } from 'react';
import { Container, Navbar, NavbarBrand, Nav, NavItem } from 'reactstrap';
import { Route, Link } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import './App.css';

import AuthWall from './routes/login';
import ListPage from './routes/list';
import DatasetPage from './routes/dataset';

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
          <NavbarBrand>AURA Explorer</NavbarBrand>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <Link className="nav-link" to="/list">
                List Datasets
              </Link>
            </NavItem>
            <NavItem>
              <Link className="nav-link" to="/" onClick={this.logoutHandler}>
                Logout
              </Link>
            </NavItem>
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
