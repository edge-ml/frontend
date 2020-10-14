import ListPage from '../../routes/list';
import { shallow, mount } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { fakeDataset_One } from '../fakeData/fakeDatasets';

import { getDatasets } from '../../services/ApiServices/DatasetServices';

jest.mock('../../services/ApiServices/DatasetServices');

const flushPromises = () => new Promise(setImmediate);

configure({ adapter: new Adapter() });

describe('Tests for list of datasets', () => {
  getDatasets.mockReturnValue(Promise.resolve([]));
  it('List rendering', () => {
    const wrapper = shallow(<ListPage></ListPage>);
    expect(wrapper.exists('#dataList')).toEqual(true);
  });

  it('Display data from api call', async done => {
    getDatasets.mockReturnValue(Promise.resolve(fakeDataset_One));

    const wrapper = mount(<ListPage></ListPage>);
    await flushPromises();
    wrapper.update();
    expect(wrapper.contains('5f45114480d85700190a9ec4')).toBe(true);
    done();
  });

  it('Callback returns no data', () => {
    const wrapper = shallow(<ListPage></ListPage>);
    wrapper.setState({
      datasets: []
    });
    expect(wrapper.contains(<tr />)).toBe(false);
  });
});
