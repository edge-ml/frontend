import UserNameSettings from '../../../components/UserSettingsModal/UserNameSettings';
import { mount, configure, shallow } from 'enzyme';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { changeUserName } from '../../../services/ApiServices/AuthentificationServices';

configure({ adapter: new Adapter() });
jest.mock('../../../services/ApiServices/AuthentificationServices');
const flushPromises = () => new Promise(setImmediate);

beforeEach(() => {
  global.confirm = () => true;
});

afterEach(() => {
  jest.clearAllMocks();
});

jest.spyOn(window, 'alert').mockImplementation(() => {});
changeUserName.mockReturnValue(Promise.resolve());

it('Render page', () => {
  const wrapper = shallow(<UserNameSettings></UserNameSettings>);
  expect(wrapper.html() !== '').toBe(true);
});

it('Success case', () => {
  const wrapper = shallow(<UserNameSettings></UserNameSettings>);
  wrapper
    .find('#inputUserName')
    .simulate('change', { target: { value: 'fakeUserName' } });
  wrapper
    .find('#inputUserNameConfirm')
    .simulate('change', { target: { value: 'fakeUserName' } });
  wrapper.find('#buttonSaveUserName').simulate('click');
  expect(changeUserName).toHaveBeenCalledWith('fakeUserName');
});

describe('Failure cases', () => {
  it('Confirmation name does not match new username', () => {
    const wrapper = shallow(<UserNameSettings></UserNameSettings>);
    wrapper
      .find('#inputUserName')
      .simulate('change', { target: { value: 'fakeUserName' } });
    wrapper
      .find('#inputUserNameConfirm')
      .simulate('change', { target: { value: 'wrongName' } });
    wrapper.find('#buttonSaveUserName').simulate('click');
    expect(changeUserName).not.toHaveBeenCalled();
  });

  it('Server rejects change of username', async () => {
    changeUserName.mockImplementation(() =>
      Promise.reject({ error: 'Backend error message' })
    );
    const wrapper = shallow(<UserNameSettings></UserNameSettings>);
    wrapper
      .find('#inputUserName')
      .simulate('change', { target: { value: 'fakeUserName' } });
    wrapper
      .find('#inputUserNameConfirm')
      .simulate('change', { target: { value: 'fakeUserName' } });
    wrapper.find('#buttonSaveUserName').simulate('click');
    expect(changeUserName).toHaveBeenCalled();
    await flushPromises();
    expect(wrapper.find('#userNameError').exists()).toBe(true);
  });
});
