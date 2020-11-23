import { mount } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';

import ExperimentsPage from './../../../routes/experiments';

import { subscribeExperiments } from '../../../services/ApiServices/ExperimentService';
import { subscribeLabelingsAndLabels } from '../../../services/ApiServices/LabelingServices';
import { fakeExperiment1, fakeLabelingData1 } from './fakeExperimentData';

jest.mock('../../../services/ApiServices/ExperimentService');
jest.mock('../../../services/ApiServices/LabelingServices');

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

const fakeHistory = { replace: jest.fn(), push: jest.fn() };

it('Render experiments page without data', async () => {
  subscribeExperiments.mockReturnValue(Promise.resolve([]));
  subscribeLabelingsAndLabels.mockReturnValue(
    Promise.resolve({ labelings: [], labels: [] })
  );
  const fakeLocation = { pathname: '/experiments/new' };
  const wrapper = mount(
    <ExperimentsPage
      location={fakeLocation}
      history={fakeHistory}
    ></ExperimentsPage>
  );
  await flushPromises();
  expect(wrapper.state().isReady).toBe(true);
});

it('Add button opens modal to create new experiment', async () => {
  subscribeExperiments.mockReturnValue(Promise.resolve([]));
  subscribeLabelingsAndLabels.mockReturnValue(
    Promise.resolve({ labelings: [], labels: [] })
  );
  const fakeLocation = { pathname: '/experiments/new' };
  const wrapper = mount(
    <ExperimentsPage
      location={fakeLocation}
      history={fakeHistory}
    ></ExperimentsPage>
  );
  await flushPromises();
  wrapper.update();
  wrapper
    .find('#btnAddExperiment')
    .first()
    .simulate('click');
  expect(wrapper.state().modal.isNewExperiment).toBe(true);
  expect(wrapper.exists('#labelingSelectionPanel')).toEqual(true);
});

it('Rendering an experiment with data from api', async () => {
  subscribeExperiments.mockReturnValue(Promise.resolve(fakeExperiment1));
  subscribeLabelingsAndLabels.mockReturnValue(
    Promise.resolve(fakeLabelingData1)
  );
  const fakeLocation = { pathname: '/experiments/new' };
  const wrapper = mount(
    <ExperimentsPage
      location={fakeLocation}
      history={fakeHistory}
    ></ExperimentsPage>
  );
  await flushPromises();
  wrapper.update();
  expect(wrapper.state().experiments).toBe(fakeExperiment1);
  expect(wrapper.state().labelings).toBe(fakeLabelingData1.labelings);
  expect(wrapper.state().labelTypes).toBe(fakeLabelingData1.labels);
});

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}
