import CombineTimeSeriesModal from '../../components/CombineTimeSeriesModal/CombineTimeSeriesModal';
import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { shallow } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import ReactDOM from 'react-dom';

import { fakeDatasetCombination_one_two } from '../fakeData/fakeDatasets';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});
ReactDOM.createPortal = jest.fn(modal => modal);

it('Render page', () => {
  const wrapper = shallow(
    <CombineTimeSeriesModal
      timeSeries={fakeDatasetCombination_one_two.timeSeries}
      isOpen={true}
    ></CombineTimeSeriesModal>
  );
  expect(wrapper.html()).not.toEqual('');
});

describe('Success cases', () => {
  const fakeOnFuse = jest.fn();
  it('Select both timeSeries, then click on fuse', () => {
    const wrapper = shallow(
      <CombineTimeSeriesModal
        timeSeries={fakeDatasetCombination_one_two.timeSeries}
        isOpen={true}
        onFuse={fakeOnFuse}
      ></CombineTimeSeriesModal>
    );
    wrapper
      .find('#checkboxTimeSeries')
      .first()
      .simulate('change', { target: { checked: true } });
    wrapper
      .find('#checkboxTimeSeries')
      .last()
      .simulate('change', { target: { checked: true } });
    wrapper.find('#buttonFuseTimeSeries').simulate('click');
    expect(fakeOnFuse).toHaveBeenCalledWith(
      fakeDatasetCombination_one_two.timeSeries.map(elm => elm._id)
    );
  });

  it('Close modal by clicking on Cancel', () => {
    const fakeOnFuseCanceled = jest.fn();
    const wrapper = shallow(
      <CombineTimeSeriesModal
        timeSeries={fakeDatasetCombination_one_two.timeSeries}
        isOpen={true}
        onFuseCanceled={fakeOnFuseCanceled}
      ></CombineTimeSeriesModal>
    );
    wrapper.find('#buttonCancelFuse').simulate('click');
    expect(fakeOnFuseCanceled).toHaveBeenCalled();
  });

  it('Select all timeSeries, deselect one and select it again', () => {
    const wrapper = shallow(
      <CombineTimeSeriesModal
        timeSeries={fakeDatasetCombination_one_two.timeSeries}
        isOpen={true}
        onFuse={fakeOnFuse}
      ></CombineTimeSeriesModal>
    );
    wrapper
      .find('#checkboxTimeSeries')
      .first()
      .simulate('change', { target: { checked: true } });
    wrapper
      .find('#checkboxTimeSeries')
      .last()
      .simulate('change', { target: { checked: true } });
    wrapper
      .find('#checkboxTimeSeries')
      .last()
      .simulate('change', { target: { checked: false } });
    wrapper
      .find('#checkboxTimeSeries')
      .last()
      .simulate('change', { target: { checked: true } });
    wrapper.find('#buttonFuseTimeSeries').simulate('click');
    expect(fakeOnFuse).toHaveBeenCalledWith(
      fakeDatasetCombination_one_two.timeSeries.map(elm => elm._id)
    );
  });
});

describe('Failure cases', () => {
  it("Don't provide timeSeries", () => {
    const wrapper = shallow(
      <CombineTimeSeriesModal isOpen={true}></CombineTimeSeriesModal>
    );
    expect(wrapper.html().includes('No time series available'));
  });

  it('Only select one timeSeries', () => {
    const fakeOnFuse = jest.fn();
    const wrapper = shallow(
      <CombineTimeSeriesModal
        timeSeries={fakeDatasetCombination_one_two.timeSeries}
        isOpen={true}
        onFuse={fakeOnFuse}
      ></CombineTimeSeriesModal>
    );
    wrapper
      .find('#checkboxTimeSeries')
      .first()
      .simulate('change', { target: { checked: true } });
    wrapper.find('#buttonFuseTimeSeries').simulate('click');
    expect(fakeOnFuse).not.toHaveBeenCalled();
  });
});
