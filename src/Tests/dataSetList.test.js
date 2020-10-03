import { unmountComponentAtNode } from 'react-dom';
import ListPage from '../routes/list';
import AuthWall from '../routes/login';
import ExperimentsPage from '../routes/experiments';
import { shallow, mount } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fakeDataset_One } from './fakeData/fakeDatasets';

import * as AuthentificationServices from '../services/ApiServices/AuthentificationServices';
import LocalStorageService from '../services/LocalStorageService';

const flushPromises = () => new Promise(setImmediate);

configure({ adapter: new Adapter() });
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return undefined;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  removeItem(key) {
    delete this.store[key];
  }
}
global.localStorage = new LocalStorageMock();

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});
describe('Tests for list of datasets', () => {
  it('List rendering', () => {
    const wrapper = shallow(<ListPage></ListPage>);
    expect(wrapper.exists('#dataList')).toEqual(true);
  });

  it('Display list of datasets from API-call', () => {
    const wrapper = shallow(<ListPage />);
    wrapper.setState({
      datasets: fakeDataset_One,
      ready: true
    });
    expect(wrapper.html().includes('5f45114480d85700190a9ec4')).toEqual(true); // Check if datasetid is shown in table
    var tableBody = wrapper.find('tbody');
    expect(tableBody.find('tr')).toHaveLength(1);
  });

  /*it("Trying to test end to end component render to data display", async (done) => {
    var mock = new MockAdapter(axios);
    mock.onGet("http://localhost/api/datasets").reply(200, fakeDataset_One);

    const wrapper = await mount(<ListPage></ListPage>);
    console.log(wrapper.html());
    expect(wrapper.html().includes("5f45114480d85700190a9ec4")).toEqual(true); // Check if datasetid is shown in table
    done();
  });*/

  it('Callback returns no data', () => {
    const wrapper = shallow(<ListPage></ListPage>);
    wrapper.setState({
      datasets: []
    });
    expect(wrapper.contains(<tr />)).toBe(false);
  });
});
