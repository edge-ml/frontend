import BlePanelRecorderSettings from '../../../components/BLE/BlePanelRecorderSettings';
import { configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { FormFeedback } from 'reactstrap';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

const fakeOnDatasetNameChanged = jest.fn();
const fakeOnClickRecordButton = jest.fn();
const fakeOnToggleSampleRate = jest.fn();
const fakeOnToggleStream = jest.fn();
const event_dataset_name_changed = {
  target: {
    value: 'test name',
  },
};
const event_mock_click = {
  target: {
    name: 'mock click',
  },
};

it('Render component', () => {
  const wrapper = shallow(
    <BlePanelRecorderSettings></BlePanelRecorderSettings>
  );
  expect(wrapper.html()).not.toBe('');
});

it('Dataset name changed', () => {
  const wrapper = shallow(
    <BlePanelRecorderSettings
      onDatasetNameChanged={fakeOnDatasetNameChanged}
    ></BlePanelRecorderSettings>
  );
  wrapper.find('Input').first().simulate('change', event_dataset_name_changed);
  expect(fakeOnDatasetNameChanged).toHaveBeenCalledWith(
    expect.objectContaining(event_dataset_name_changed)
  );
});

it('Click record button with recorder state ready', () => {
  const wrapper = shallow(
    <BlePanelRecorderSettings
      recorderState={'ready'}
      datasetName={'test name'}
      sampleRate={20}
      onClickRecordButton={fakeOnClickRecordButton}
      sensorsSelected={true}
    ></BlePanelRecorderSettings>
  );
  wrapper.find('SpinnerButton').simulate('click', event_mock_click);
  expect(fakeOnClickRecordButton).toHaveBeenCalledWith(
    expect.objectContaining(event_mock_click)
  );
});

it('Click record button with recorder state not ready', () => {
  const wrapper = mount(
    <BlePanelRecorderSettings
      recorderState={'startup'}
      datasetName={'test name'}
      sampleRate={20}
      onClickRecordButton={fakeOnClickRecordButton}
      sensorsSelected={true}
    ></BlePanelRecorderSettings>
  );
  wrapper.find('SpinnerButton').simulate('click', event_mock_click);
  expect(fakeOnClickRecordButton).not.toHaveBeenCalled();
});

it('Click record button without a dataset name', () => {
  const wrapper = shallow(
    <BlePanelRecorderSettings
      datasetName={''}
      sampleRate={20}
      onClickRecordButton={fakeOnClickRecordButton}
      sensorsSelected={true}
    ></BlePanelRecorderSettings>
  );
  wrapper.find('SpinnerButton').simulate('click', event_mock_click);
  expect(fakeOnClickRecordButton).not.toHaveBeenCalled();
  expect(
    wrapper.containsMatchingElement(
      <FormFeedback>A dataset needs a name</FormFeedback>
    )
  ).toBe(true);
});

it('Click record button without selecting sensors', () => {
  const wrapper = shallow(
    <BlePanelRecorderSettings
      datasetName={'test name'}
      sampleRate={20}
      onClickRecordButton={fakeOnClickRecordButton}
      sensorsSelected={false}
    ></BlePanelRecorderSettings>
  );
  wrapper.find('SpinnerButton').simulate('click', event_mock_click);
  expect(fakeOnClickRecordButton).not.toHaveBeenCalled();
  expect(
    wrapper.containsMatchingElement(<div>Sensors need to be selected</div>)
  ).toBe(true);
});

it('Click record button with invalid sample rate', () => {
  const wrapper = shallow(
    <BlePanelRecorderSettings
      datasetName={'test name'}
      sampleRate={100}
      onClickRecordButton={fakeOnClickRecordButton}
      sensorsSelected={true}
    ></BlePanelRecorderSettings>
  );
  wrapper.find('SpinnerButton').simulate('click', event_mock_click);
  expect(fakeOnClickRecordButton).not.toHaveBeenCalled();
});

it('Toggle streaming feature', () => {
  const wrapper = shallow(
    <BlePanelRecorderSettings
      onToggleStream={fakeOnToggleStream}
    ></BlePanelRecorderSettings>
  );
  wrapper.find('#stream-check').first().simulate('change');
  expect(fakeOnToggleStream).toHaveBeenCalled();
});

it('Tick checkbox for streaming at full sampling rate', () => {
  const wrapper = shallow(
    <BlePanelRecorderSettings
      onToggleSampleRate={fakeOnToggleSampleRate}
      fullSampleRate={true}
    ></BlePanelRecorderSettings>
  );
  wrapper.find('#sampleRate-check').first().simulate('change');
  expect(fakeOnToggleSampleRate).toHaveBeenCalled();
  expect(wrapper.containsMatchingElement(<strong>Warning: </strong>)).toBe(
    true
  );
});
