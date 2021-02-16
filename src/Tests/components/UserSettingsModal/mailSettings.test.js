import MailSettings from '../../../components/UserSettingsModal/MailSettings';
import { mount, configure } from 'enzyme';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { changeUserMail } from '../../../services/ApiServices/AuthentificationServices';

configure({ adapter: new Adapter() });
jest.mock('../../../services/ApiServices/AuthentificationServices');

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('Change e-mail address', () => {
  changeUserMail.mockReturnValue(Promise.resolve());
  const wrapper = mount(<MailSettings></MailSettings>);
  wrapper
    .find('#inputNewMail')
    .first()
    .simulate('change', { target: { value: 'newTestMail@teco.edu' } });
  wrapper
    .find('#inputNewMailConfirm')
    .first()
    .simulate('change', { target: { value: 'newTestMail@teco.edu' } });
  wrapper
    .find('#buttonSaveNewMail')
    .first()
    .simulate('click');
  expect(wrapper.find('#emailError').exists()).toBe(false);
  expect(changeUserMail).toBeCalledWith('newTestMail@teco.edu');
});

it('E-mails do not match', () => {
  const wrapper = mount(<MailSettings></MailSettings>);
  wrapper
    .find('#inputNewMail')
    .first()
    .simulate('change', { target: { value: 'newTestMail@teco.edu' } });
  wrapper
    .find('#inputNewMailConfirm')
    .first()
    .simulate('change', { target: { value: 'notmatchingMail@teco.edu' } });
  wrapper
    .find('#buttonSaveNewMail')
    .first()
    .simulate('click');
  expect(changeUserMail).not.toBeCalled();
});

it('Input is not an e-mail address', () => {
  const wrapper = mount(<MailSettings></MailSettings>);
  wrapper
    .find('#inputNewMail')
    .first()
    .simulate('change', { target: { value: 'notAMail' } });
  wrapper
    .find('#inputNewMailConfirm')
    .first()
    .simulate('change', { target: { value: 'notAMail' } });
  wrapper
    .find('#buttonSaveNewMail')
    .first()
    .simulate('click');
  expect(wrapper.find('#emailError').exists()).toBe(true);
});

it('Backend rejects e-mail change request', async () => {
  changeUserMail.mockImplementation(() =>
    Promise.reject({ error: 'Backend error message' })
  );
  const wrapper = mount(<MailSettings></MailSettings>);
  wrapper
    .find('#inputNewMail')
    .first()
    .simulate('change', { target: { value: 'newTestMail@teco.edu' } });
  wrapper
    .find('#inputNewMailConfirm')
    .first()
    .simulate('change', { target: { value: 'newTestMail@teco.edu' } });
  wrapper
    .find('#buttonSaveNewMail')
    .first()
    .simulate('click');
  await flushPromises();
  wrapper.update();
  expect(wrapper.find('#emailError').exists()).toBe(true);
  expect(changeUserMail).toBeCalledWith('newTestMail@teco.edu');
  expect(wrapper.find('#emailError').text()).toEqual('Backend error message');
});

it('No user input does not change anything', () => {
  const wrapper = mount(<MailSettings></MailSettings>);
  const wrapperJson = JSON.stringify(wrapper);
  wrapper
    .find('#buttonSaveNewMail')
    .first()
    .simulate('click');
  expect(JSON.stringify(wrapper)).toEqual(wrapperJson);
});

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}
