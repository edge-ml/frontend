import ListPage from '../../routes/list';
import { mount } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { fakeDataset_One } from '../fakeData/fakeDatasets';

import {
  deleteDatasets,
  getDatasets
} from '../../services/ApiServices/DatasetServices';
import ErrorPage from '../../components/ErrorPage/ErrorPage';

jest.mock('../../services/ApiServices/DatasetServices');
jest.mock('../../components/ErrorPage/ErrorPage', () => {
  const mockErrorPage = () => <div id="mockErrorPage">ErrorPage</div>;
  return mockErrorPage;
});

const flushPromises = () => new Promise(setImmediate);

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Success cases', () => {
  it('List rendering', async () => {
    getDatasets.mockReturnValue(Promise.resolve([]));
    const wrapper = mount(<ListPage></ListPage>);
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
    const wrapper = mount(<ListPage></ListPage>);
    wrapper.setState({ datasets: [] });
    expect(wrapper.contains(<tr />)).toBe(false);
  });
});

describe('Failure cases', () => {
  it('Failure to fetch list of datasets', async () => {
    const error = {
      status: 404,
      statusText: 'Unauthorized',
      data: {
        error: 'You need to provide a valid JWT-Token'
      }
    };
    getDatasets.mockReturnValue(Promise.reject(error));
    const wrapper = mount(<ListPage></ListPage>);
    await flushPromises();
    wrapper.update();
    expect(wrapper.find('#mockErrorPage').exists()).toBe(true);
  });

  it('Failure to delete datasets', async () => {
    const error = {
      status: 500,
      statusText: 'Internal Server Error',
      data: {
        error: 'You need to provide a valid JWT-Token'
      }
    };

    getDatasets.mockReturnValue(Promise.resolve(fakeDataset_One));
    deleteDatasets.mockImplementation(() => {
      return Promise.reject(error);
    });

    const wrapper = mount(<ListPage></ListPage>);

    await flushPromises();
    wrapper.update();
    wrapper
      .find('.datasets-check')
      .first()
      .simulate('change', {
        target: {
          checked: true
        }
      });
    wrapper
      .find('#deleteDatasetsButton')
      .first()
      .simulate('click');
    wrapper
      .find('#deleteDatasetsButtonFinal')
      .first()
      .simulate('click');
    await flushPromises();
    wrapper.update();

    expect(wrapper.find('#mockErrorPage').exists()).toBe(true);
  });
});
