import LabelingSelectionPanel from '../../components/LabelingSelectionPanel/LabelingSelectionPanel';
import { mount, shallow } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';

import { fakeLabeling_One } from '../fakeData/fakeLabelings';

const flushPromises = () => new Promise(setImmediate);

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('Render page', () => {
  const wrapper = shallow(
    <LabelingSelectionPanel
      labelings={[fakeLabeling_One]}
    ></LabelingSelectionPanel>
  );
  expect(
    wrapper
      .find('#buttonLabeling')
      .props()
      .children.includes(fakeLabeling_One.name)
  ).toBe(true);
});

it('Select label by clicking on it', () => {
  const fakeOnSelectedLabelingIdChanged = jest.fn();
  const wrapper = shallow(
    <LabelingSelectionPanel
      labelings={[fakeLabeling_One]}
      onSelectedLabelingIdChanged={fakeOnSelectedLabelingIdChanged}
    ></LabelingSelectionPanel>
  );
  wrapper.find('#buttonLabeling').simulate('click', {
    preventDefault: () => {}
  });
  expect(fakeOnSelectedLabelingIdChanged).toHaveBeenCalledWith(
    fakeLabeling_One._id
  );
});

it('Click on Add button redirects to new page to create labeling', () => {
  const fakeOnAddLabeling = jest.fn();
  const wrapper = shallow(
    <LabelingSelectionPanel
      onAddLabeling={fakeOnAddLabeling}
      labelings={[fakeLabeling_One]}
    ></LabelingSelectionPanel>
  );
  wrapper.find('#buttonAddLabeling').simulate('click');
  expect(fakeOnAddLabeling).toBeCalled();
});
