import PasswordSettings from '../../../components/UserSettingsModal/PasswordSettings';
import { mount, configure } from 'enzyme';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { changeUserPassword } from '../../../services/ApiServices/AuthentificationServices';

configure({ adapter: new Adapter() });
jest.mock('../../../services/ApiServices/AuthentificationServices');

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('Change user password', () => {
  changeUserPassword.mockReturnValue(Promise.resolve());
  const wrapper = mount(<PasswordSettings></PasswordSettings>);
  wrapper
    .find('#inputNewPassword')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#inputNewPasswordConfirm')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#inputCurrentPassword')
    .first()
    .simulate('change', { target: { value: 'oldPassword' } });
  wrapper
    .find('#buttonSaveNewPassword')
    .first()
    .simulate('click');
  expect(wrapper.find('#passwordError').exists()).toBe(false);
  expect(changeUserPassword).toBeCalledWith('oldPassword', 'testPassword');
});

it('New passwords do not match', () => {
  const wrapper = mount(<PasswordSettings></PasswordSettings>);
  wrapper
    .find('#inputNewPassword')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#inputNewPasswordConfirm')
    .first()
    .simulate('change', { target: { value: 'notTestPassword' } });
  wrapper
    .find('#inputCurrentPassword')
    .first()
    .simulate('change', { target: { value: 'oldPassword' } });
  wrapper
    .find('#buttonSaveNewPassword')
    .first()
    .simulate('click');
  expect(wrapper.find('#passwordError').exists()).toBe(true);
  expect(changeUserPassword).not.toBeCalled();
});

it('Backend rejects password change', async () => {
  changeUserPassword.mockImplementation(() =>
    Promise.reject({ data: 'Backend reject message' })
  );
  const wrapper = mount(<PasswordSettings></PasswordSettings>);
  wrapper
    .find('#inputNewPassword')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#inputNewPasswordConfirm')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#inputCurrentPassword')
    .first()
    .simulate('change', { target: { value: 'oldPassword' } });
  wrapper
    .find('#buttonSaveNewPassword')
    .first()
    .simulate('click');
  await flushPromises();
  wrapper.update();
  expect(wrapper.find('#passwordError').exists()).toBe(true);
  expect(wrapper.find('#passwordError').text()).toEqual(
    'Backend reject message'
  );
});

it('No user input does not change anything', () => {
  const wrapper = mount(<PasswordSettings></PasswordSettings>);
  const wrapperJSON = JSON.stringify(wrapper);
  wrapper
    .find('#buttonSaveNewPassword')
    .first()
    .simulate('click');
  expect(JSON.stringify(wrapper)).toEqual(wrapperJSON);
});

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}
