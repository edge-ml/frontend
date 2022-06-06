import CodeSnippetModal from '../../../components/ApiSnippetsModal/CodeSnippetModal';
import { mount, shallow, configure } from 'enzyme';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

const fakeBackendUrl = 'http://localhost:3001';
const fakeDeviceApiKey = 'zfKELhL.0imfmn9mVJWssAbcjYr6Ry-Xf51DDqtlx';
const fakeOntoggleCodeSnippetModalFalse = jest.fn();

const event_new_dataset = {
  target: {
    value: 'New dataset name',
  },
};

const event_change_platform = {
  target: {
    value: 'Android',
  },
};

const event_use_servertime = {
  target: {
    value: 'Yes',
  },
};

const event_not_using_servertime = {
  target: {
    value: 'No',
  },
};

it('Render code snippet modal', () => {
  const wrapper = mount(
    <CodeSnippetModal
      isOpen={true}
      onCancel={() => fakeOntoggleCodeSnippetModalFalse}
      backendUrl={fakeBackendUrl}
      deviceApiKey={fakeDeviceApiKey}
    ></CodeSnippetModal>
  );
  expect(wrapper.html()).not.toBe('');
});

it('On cancel code snippet modal', () => {
  const spy = jest.spyOn(CodeSnippetModal.prototype, 'onCancel');
  const wrapper = shallow(
    <CodeSnippetModal
      isOpen={true}
      onCancel={() => fakeOntoggleCodeSnippetModalFalse}
      backendUrl={fakeBackendUrl}
      deviceApiKey={fakeDeviceApiKey}
    ></CodeSnippetModal>
  );
  wrapper.find('#btnSaveProjectCancel').first().simulate('click');
  expect(spy).toHaveBeenCalled();
  spy.mockClear();
});

it('On dataset name changed', () => {
  const spy = jest.spyOn(CodeSnippetModal.prototype, 'onDatasetNameChanged');
  const wrapper = shallow(
    <CodeSnippetModal
      isOpen={true}
      onCancel={() => fakeOntoggleCodeSnippetModalFalse}
      backendUrl={fakeBackendUrl}
      deviceApiKey={fakeDeviceApiKey}
    ></CodeSnippetModal>
  );
  wrapper.find('Input').first().simulate('change', event_new_dataset);
  expect(spy).toHaveBeenCalledWith(expect.objectContaining(event_new_dataset));
  spy.mockClear();
});

it('On platform and use servertime change', () => {
  const spy1 = jest.spyOn(CodeSnippetModal.prototype, 'onServerTimeChange');
  const spy2 = jest.spyOn(CodeSnippetModal.prototype, 'onPlatformChange');
  const wrapper = shallow(
    <CodeSnippetModal
      isOpen={true}
      onCancel={() => fakeOntoggleCodeSnippetModalFalse}
      backendUrl={fakeBackendUrl}
      deviceApiKey={fakeDeviceApiKey}
    ></CodeSnippetModal>
  );
  wrapper.instance().onServerTimeChange(event_use_servertime);
  wrapper.instance().onPlatformChange(event_change_platform);
  expect(wrapper.state().servertime).toBe(true);
  expect(wrapper.state().platform).toBe(event_change_platform.target.value);
  spy1.mockClear();
  spy2.mockClear();
});

it('Do not use servertime', () => {
  const spy = jest.spyOn(CodeSnippetModal.prototype, 'onServerTimeChange');
  const wrapper = shallow(
    <CodeSnippetModal
      isOpen={true}
      onCancel={() => fakeOntoggleCodeSnippetModalFalse}
      backendUrl={fakeBackendUrl}
      deviceApiKey={fakeDeviceApiKey}
    ></CodeSnippetModal>
  );
  wrapper.instance().onServerTimeChange(event_not_using_servertime);
  expect(wrapper.state().servertime).toBe(false);
  spy.mockClear();
});
