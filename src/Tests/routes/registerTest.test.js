import RegisterPage from '../../routes/register';
import { configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import { registerNewUser } from '../../services/ApiServices/AuthentificationServices';

jest.mock('../../services/ApiServices/AuthentificationServices');
jest.mock('../../services/LocalStorageService');

configure({ adapter: new Adapter() });

const fakeHistory = { push: jest.fn() };

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('Success case', async () => {
  registerNewUser.mockReturnValue(Promise.resolve());
  const wrapper = mount(<RegisterPage history={fakeHistory}></RegisterPage>);
  wrapper
    .find('#email')
    .first()
    .simulate('change', { target: { value: 'test@email.com' } });
  wrapper
    .find('#password')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#passwordRepeat')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#username')
    .first()
    .simulate('change', { target: { value: 'testName' } });
  wrapper
    .find('#registerButton')
    .first()
    .props()
    .onClick();
  await flushPromises();
  expect(wrapper.find('#errorIcon').length).toBe(0);
  expect(registerNewUser).toBeCalledWith(
    'test@email.com',
    'testPassword',
    'testName'
  );
  expect(fakeHistory.push).toBeCalledWith({
    pathname: '/',
    search: ''
  });
});

it('Enter nothing', async () => {
  const wrapper = mount(<RegisterPage history={fakeHistory}></RegisterPage>);
  wrapper
    .find('#registerButton')
    .first()
    .props()
    .onClick();
  await flushPromises();
  wrapper.update();
  expect(wrapper.find('#errorIcon').length).not.toBe(0);
  expect(wrapper.state().error).not.toBe('');
  expect(fakeHistory.push).not.toBeCalled();
});

it('Enter no email', async () => {
  const wrapper = mount(<RegisterPage history={fakeHistory}></RegisterPage>);
  wrapper
    .find('#password')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#passwordRepeat')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#registerButton')
    .first()
    .props()
    .onClick();
  await flushPromises();
  expect(wrapper.state().error).not.toBe('');
  expect(fakeHistory.push).not.toBeCalled();
});

it('Enter invalid email', async () => {
  const wrapper = mount(<RegisterPage history={fakeHistory}></RegisterPage>);
  wrapper
    .find('#email')
    .first()
    .simulate('change', { target: { value: 'test' } });
  wrapper
    .find('#password')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#passwordRepeat')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#registerButton')
    .first()
    .props()
    .onClick();
  await flushPromises();
  expect(wrapper.state().error).not.toBe('');
  expect(fakeHistory.push).not.toBeCalled();
});

it('Enter no passwords', async () => {
  const wrapper = mount(<RegisterPage history={fakeHistory}></RegisterPage>);
  wrapper
    .find('#email')
    .first()
    .simulate('change', { target: { value: 'test@email.com' } });
  wrapper
    .find('#registerButton')
    .first()
    .props()
    .onClick();
  await flushPromises();
  wrapper.update();
  expect(wrapper.find('#errorIcon').length).not.toBe(0);
  expect(wrapper.state().error).not.toBe('');
  expect(fakeHistory.push).not.toBeCalled();
});

it('Enter different passwords', async () => {
  const wrapper = mount(<RegisterPage history={fakeHistory}></RegisterPage>);
  wrapper
    .find('#email')
    .first()
    .simulate('change', { target: { value: 'test@email.com' } });
  wrapper
    .find('#password')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#passwordRepeat')
    .first()
    .simulate('change', { target: { value: 'test' } });
  wrapper
    .find('#registerButton')
    .first()
    .props()
    .onClick();
  await flushPromises();
  wrapper.update();
  expect(wrapper.find('#errorIcon').length).not.toBe(0);
  expect(wrapper.state().error).not.toBe('');
  expect(fakeHistory.push).not.toBeCalled();
});

it('Enter only one password', async () => {
  const wrapper = mount(<RegisterPage history={fakeHistory}></RegisterPage>);
  wrapper
    .find('#email')
    .first()
    .simulate('change', { target: { value: 'test@email.com' } });
  wrapper
    .find('#password')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#registerButton')
    .first()
    .props()
    .onClick();
  await flushPromises();
  wrapper.update();
  expect(wrapper.find('#errorIcon').length).not.toBe(0);
  expect(wrapper.state().error).not.toBe('');
  expect(fakeHistory.push).not.toBeCalled();
});

it('Username already exists', async () => {
  registerNewUser.mockImplementation(() =>
    Promise.reject(
      'E11000 duplicate key error collection: auth_dev.users index: userName_1 dup key: { userName: "testName" }'
    )
  );

  const wrapper = shallow(<RegisterPage history={fakeHistory}></RegisterPage>);
  wrapper
    .find('#email')
    .first()
    .simulate('change', { target: { value: 'test@email.com' } });
  wrapper
    .find('#password')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#passwordRepeat')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#username')
    .first()
    .simulate('change', { target: { value: 'testName' } });
  wrapper
    .find('#registerButton')
    .first()
    .props()
    .onClick();
  await flushPromises();
  wrapper.update();
  expect(wrapper.find('#errorIcon').length).not.toBe(0);
  expect(fakeHistory.push).not.toBeCalled();
});

it('Email already exists', async () => {
  registerNewUser.mockImplementation(() =>
    Promise.reject(
      'E11000 duplicate key error collection: auth_dev.users index: email_1 dup key: { email: test@teco.edu }'
    )
  );

  const wrapper = shallow(<RegisterPage history={fakeHistory}></RegisterPage>);
  wrapper
    .find('#email')
    .first()
    .simulate('change', { target: { value: 'test@email.com' } });
  wrapper
    .find('#password')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#passwordRepeat')
    .first()
    .simulate('change', { target: { value: 'testPassword' } });
  wrapper
    .find('#username')
    .first()
    .simulate('change', { target: { value: 'testName' } });
  wrapper
    .find('#registerButton')
    .first()
    .props()
    .onClick();
  await flushPromises();
  wrapper.update();
  expect(wrapper.find('#errorIcon').length).not.toBe(0);
  expect(fakeHistory.push).not.toBeCalled();
});

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}
