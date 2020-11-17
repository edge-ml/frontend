import { mount } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';

import LabelingsPage from './../../../routes/labelings';
import { fakeLabelingData } from './fakeLabelingData';

import { subscribeLabelingsAndLabels } from '../../../services/ApiServices/LabelingServices';
jest.mock('../../../services/ApiServices/LabelingServices');

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Success cases', () => {
  it('Render labeling page with content', async () => {
    const labelings = fakeLabelingData.labelings;
    const labels = fakeLabelingData.labels;

    subscribeLabelingsAndLabels.mockReturnValue(
      Promise.resolve(labelings, labels)
    );

    delete window.location;
    const location = new URL('http://localhost:3001/labelings');
    global.URLSearchParams = jest.fn(x => ({
      get: jest.fn(() => undefined)
    }));

    const wrapper = mount(
      <LabelingsPage location={location} history=""></LabelingsPage>
    );
    await flushPromises();
    wrapper.update();
    labelings.map(labeling => {
      expect(wrapper.contains(labeling['_id']));
    });
  });
});

const flushPromises = () => new Promise(setImmediate);
