import React, { Component } from 'react';
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Input,
  Table,
  CustomInput,
  Col,
  Row,
  Alert,
  Container,
  Collapse,
} from 'reactstrap';
import ListItem from './ListItem';

import { Prompt, withRouter } from 'react-router-dom';

import {
  deleteProject,
  updateProject,
} from './../../services/ApiServices/ProjectService';
import {
  switchDeviceApiActive,
  getDeviceApiKey,
  setDeviceApiKey,
  deleteDeviceApiKey,
} from '../../services/ApiServices/DeviceApiService';
import { API_URI } from './../../services/ApiServices/ApiConstants';

import NoProjectPage from './../../components/NoProjectPage/NoProjectPage';
import { getUserNameSuggestions } from '../../services/ApiServices/AuthentificationServices';
import CodeSnippetModal from '../../components/ApiSnippetsModal/CodeSnippetModal';
import { FormGroup } from 'react-bootstrap';
import AutoCompleteInput from '../../components/AutoCompleteInput/AutocompleteInput';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const options = [
  {
    header: {
      name: 'General',
    },
    values: [
      {
        name: 'Edit Project Name',
        description: 'Edit the name of this project',
        tags: ['admin', 'name'],
      },
      {
        name: 'Delete Project',
        description: 'Completely remove the project',
        tags: ['delete', 'remove'],
      },
    ],
  },
  {
    header: {
      name: 'Device API',
    },
    values: [
      {
        name: 'Key Settings',
        description: 'Create or remove device API key',
        tags: ['change key', 'remove key', 'get code'],
      },
    ],
  },
  {
    header: {
      name: 'Users',
    },
    values: [
      {
        name: 'Edit Users',
        description: 'Add or remove users from project',
        tags: ['add user', 'delete user', 'remove user', 'change user name'],
      },
    ],
  },
];

class Settings extends Component {
  constructor(props) {
    super(props);
    if (props.project) {
      this.state = {
        error: undefined,
        project: JSON.parse(JSON.stringify(props.project)),
        deviceKey: undefined,
        userSearchValue: '',
        codeSnippetModalOpen: props.codeSnippetModalOpen || false,
        alertText: undefined,
        saveSuccess: undefined,
        visibleOptions: options,
      };
    } else {
      this.state = {
        error: undefined,
        originalProject: undefined,
        project: undefined,
        originalUsers: [],
        alertText: undefined,
        saveSuccess: undefined,
        visibleOptions: options,
      };
    }
    this.setVisibleOptions = this.setVisibleOptions.bind(this);
    this.mapOptions = this.mapOptions.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
  }

  setVisibleOptions(options) {
    this.setState({ visibleOptions: options });
  }

  onChangeSearch(e) {
    e.preventDefault();
    const value = e.target.value;

    if (value.trim().length === 0) {
      this.setVisibleOptions(options);
      return;
    }

    const returnedItems = [];
    this.state.visibleOptions.forEach((option, index) => {
      const foundOptions = option.values.filter((item) => {
        return (
          item.name.toLocaleLowerCase().search(value.trim().toLowerCase()) !==
            -1 ||
          item.description
            .toLocaleLowerCase()
            .search(value.trim().toLowerCase()) !== -1
        );
      });
      returnedItems[index] = {
        header: {
          name: option.header.name,
        },
        values: foundOptions,
      };
    });

    this.setVisibleOptions(returnedItems);
  }

  mapOptions() {
    return this.state.visibleOptions.map((option) => (
      <div key={option.header.name} className="mt-5 mb-2">
        <h3>{option.header.name}</h3>
        <div>
          {option.values.map((value) => (
            <ListItem value={value}></ListItem>
          ))}
        </div>
      </div>
    ));
  }

  render() {
    return (
      <Container className="my-5">
        <h3>{'Project Settings'}</h3>
        <Input
          type="text"
          className="form-control mt-3"
          placeholder="Search..."
          onChange={this.onChangeSearch}
        ></Input>
        {this.mapOptions()}
      </Container>
    );
  }
}
export default Settings;
