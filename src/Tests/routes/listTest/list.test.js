import ListPage from '../../../routes/list';
import { mount, shallow } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { fakeDataset_One } from '../../fakeData/fakeDatasets';

import {
  deleteDatasets,
  getDataset,
  getDatasets
} from '../../../services/ApiServices/DatasetServices';

jest.mock('../../../services/ApiServices/DatasetServices');
jest.mock('../../../components/ErrorPage/ErrorPage', () => {
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
  it('Render page', async () => {
    getDatasets.mockReturnValue(Promise.resolve([]));
    const wrapper = mount(<ListPage></ListPage>);
    await flushPromises();
    wrapper.update();
    expect(wrapper.exists('#dataList')).toEqual(true);
  });

  it('Render page with data', async () => {
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    const wrapper = shallow(<ListPage></ListPage>);
    await flushPromises();
    expect(wrapper.exists('#dataList')).toEqual(true);
    expect(wrapper.html().includes(fakeDataset_One.name)).toEqual(true);
  });

  it('Display data from api call', async done => {
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    const wrapper = mount(<ListPage></ListPage>);
    await flushPromises();
    wrapper.update();
    expect(wrapper.contains(fakeDataset_One.name)).toBe(true);
    done();
  });

  it('Backend returns empty list of datasets', () => {
    getDatasets.mockReturnValue(Promise.resolve([]));
    const wrapper = shallow(<ListPage></ListPage>);
  });

  it('Delete dataset', async () => {
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    window.alert = jest.fn();
    deleteDatasets.mockReturnValue(Promise.resolve());
    const wrapper = shallow(<ListPage></ListPage>);

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
    expect(deleteDatasets).toHaveBeenCalledWith([fakeDataset_One._id]);
    expect(wrapper.html().includes(fakeDataset_One._id)).not.toBe(true);
  });

  it('Datasets can be selected an deselected', async () => {
    getDataset.mockReturnValue(Promise.resolve([fakeDataset_One]));
    deleteDatasets.mockReturnValue(Promise.resolve());
    const wrapper = shallow(<ListPage></ListPage>);

    await flushPromises();
    wrapper.update();

    // Select, deselect and then select again
    wrapper
      .find('.datasets-check')
      .first()
      .simulate('change', {
        target: {
          checked: true
        }
      });
    wrapper
      .find('.datasets-check')
      .first()
      .simulate('change', {
        target: {
          checked: false
        }
      });
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
    expect(deleteDatasets).toHaveBeenCalledWith([fakeDataset_One._id]);
    expect(wrapper.html().includes(fakeDataset_One._id)).not.toBe(true);
  });

  it('Open Modal to create new datasets', async () => {
    getDatasets.mockReturnValue(Promise.resolve([]));
    const wrapper = shallow(<ListPage></ListPage>);
    await flushPromises();
    wrapper.update();
    wrapper.find('#buttonCreateDatasets').simulate('click');
    expect(wrapper.find('CreateNewDatasetModal').exists()).toBe(true);
  });

  it('Click on button to view dataset', async () => {
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    const fakeHistory = { push: jest.fn() };
    const wrapper = shallow(<ListPage history={fakeHistory}></ListPage>);
    await flushPromises();
    wrapper.update();
    wrapper.find('#buttonViewDatasets').simulate('click');
    expect(fakeHistory.push).toHaveBeenCalledWith({
      pathname: 'datasets/' + fakeDataset_One._id,
      state: { dataset: fakeDataset_One }
    });
  });
});

describe('Failure cases', () => {
  window.alert = jest.fn();
  it('Failure to fetch list of datasets', async () => {
    const error = {
      status: 404,
      statusText: 'Unauthorized',
      data: {
        error: 'You need to provide a valid JWT-Token'
      }
    };
    getDatasets.mockReturnValue(Promise.reject(error));
    const wrapper = shallow(<ListPage></ListPage>);
    await flushPromises();
    wrapper.update();
    expect(window.alert).toHaveBeenCalledWith(
      'Could not receive datasets from server'
    );
  });

  it('Failure to delete datasets', async () => {
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    window.alert = jest.fn();
    deleteDatasets.mockImplementation(() => {
      return Promise.reject();
    });

    const fakeHistory = { push: jest.fn() };
    const wrapper = mount(<ListPage history={fakeHistory}></ListPage>);

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
    expect(window.alert).toHaveBeenCalledWith('Error deleting datasets');
  });
});
