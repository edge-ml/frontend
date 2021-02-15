import LabelingsPage from './../../../routes/labelings';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';

import { fakeLabelingData } from './fakeLabelingData';

import { subscribeLabelingsAndLabels } from '../../../services/ApiServices/LabelingServices';
jest.mock('../../../services/ApiServices/LabelingServices');

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

const labelings = fakeLabelingData.labelings;
const labels = fakeLabelingData.labels;

it('Render without content', () => {
  delete window.location;
  const fakeLocation = new URL(
    'http://localhost:3001/fakeUserName/fakePRojectID/labelings'
  );
  global.URLSearchParams = jest.fn(x => ({
    get: jest.fn(() => undefined)
  }));
  subscribeLabelingsAndLabels.mockReturnValue(
    Promise.resolve(labelings, labels)
  );
  const wrapper = shallow(
    <LabelingsPage location={fakeLocation}></LabelingsPage>
  );
  expect(true);
});

describe('Success cases', () => {
  delete window.location;
  const location = new URL(
    'http://localhost:3001/fakeUserName/fakePRojectID/labelings'
  );
  global.URLSearchParams = jest.fn(x => ({
    get: jest.fn(() => undefined)
  }));

  const fakeHistory = {
    replace: jest.fn(),
    location: { pathname: location.pathname }
  };

  it('Render page with content', async () => {
    subscribeLabelingsAndLabels.mockReturnValue(
      Promise.resolve({ labelings: labelings, labels: labels })
    );
    const wrapper = shallow(
      <LabelingsPage location={location} history={fakeHistory}></LabelingsPage>
    );
    await flushPromises();
    wrapper.update();
    labelings.forEach(labeling =>
      expect(wrapper.html().includes(labeling['_id'])).toBe(true)
    );
  });

  it('Click on edit button should open modal to edit labeling', async () => {
    subscribeLabelingsAndLabels.mockReturnValue(
      Promise.resolve({ labelings: labelings, labels: labels })
    );
    const wrapper = shallow(
      <LabelingsPage location={location} history={fakeHistory}></LabelingsPage>
    );
    await flushPromises();
    wrapper.update();
    wrapper
      .find('#buttonEditLabeling')
      .first()
      .simulate('click');
    expect(fakeHistory.replace).toHaveBeenCalledWith({
      pathname: 'labelings',
      search: '?id=' + labelings[0]._id
    });
  });

  it('Click on add button should open modal to add labeling', async () => {
    subscribeLabelingsAndLabels.mockReturnValue(
      Promise.resolve({ labelings: labelings, labels: labels })
    );
    const wrapper = shallow(
      <LabelingsPage location={location} history={fakeHistory}></LabelingsPage>
    );
    await flushPromises();
    wrapper.update();
    wrapper.find('#buttonAddLabeling').simulate('click');
    expect(fakeHistory.replace).toHaveBeenCalledWith({
      pathname: fakeHistory.location.pathname + '/new',
      search: null
    });
  });
});

const flushPromises = () => new Promise(setImmediate);
