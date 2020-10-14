import AuthWall from '../../routes/login';
import { configure, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {
  login_twoFAEnabled_twoFAVerified,
  loginReturn_twoFAVerified
} from '../fakeData/fakeLoginData';

import {
  loginUser,
  verify2FA
} from '../../services/ApiServices/AuthentificationServices';

import { jwtValidForever, jwtNeverValid } from '../fakeData/fakeJwtTokens';

import { getAccessToken } from '../../services/LocalStorageService';

jest.mock('../../services/ApiServices/AuthentificationServices');
jest.mock('../../services/LocalStorageService');

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Login tests', () => {
  it('Explorer Login rendering', () => {
    const wrapper = mount(<AuthWall />);
    const header = 'Explorer Login';
    expect(wrapper.contains(header)).toEqual(true);
  });

  it('Login with 2FA disabled', async () => {
    const fakeLoginData = {
      access_token: 'fakeAccessToken',
      refresh_token: 'fakeRefreshToken',
      twoFactorEnabled: false,
      twoFactorVerified: false
    };
    loginUser.mockReturnValue(Promise.resolve(fakeLoginData));

    const result = mount(
      <AuthWall setUser={() => {}}>
        <h1>WebsiteContent</h1>
      </AuthWall>
    );
    result
      .find('#email')
      .first()
      .simulate('change', { target: { value: 'no1@teco.edu' } });
    result
      .find('#password')
      .first()
      .simulate('change', { target: { value: 'admin' } });
    result
      .find('#login-button')
      .first()
      .simulate('click');
    await tick();
    result.update();
    expect(result.html().includes('<h1>WebsiteContent</h1>')).toEqual(true);
  });

  it('Login with 2FA enabled', async () => {
    const fakeLoginData = {
      access_token: 'fakeAccessToken',
      refresh_token: 'fakeRefreshToken',
      twoFactorEnabled: true,
      twoFactorVerified: false
    };

    loginUser.mockReturnValue(Promise.resolve(fakeLoginData));

    const result = mount(
      <AuthWall setUser={() => {}}>
        <h1>WebsiteContent</h1>
      </AuthWall>
    );
    result
      .find('#email')
      .first()
      .simulate('change', { target: { value: 'no1@teco.edu' } });
    result
      .find('#password')
      .first()
      .simulate('change', { target: { value: 'admin' } });
    result
      .find('#login-button')
      .first()
      .simulate('click');
    await tick();
    result.update();
    expect(result.html().includes('<b>Two Factor Authentication</b>')).toEqual(
      true
    );
  });

  it('Login with 2FA enabled and token input', async () => {
    loginUser.mockReturnValue(
      Promise.resolve(login_twoFAEnabled_twoFAVerified)
    );
    verify2FA.mockReturnValue(Promise.resolve(loginReturn_twoFAVerified));

    const result = mount(
      <AuthWall setUser={() => {}}>
        <h1>WebsiteContent</h1>
      </AuthWall>
    );
    result
      .find('#email')
      .first()
      .simulate('change', { target: { value: 'no1@teco.edu' } });
    result
      .find('#password')
      .first()
      .simulate('change', { target: { value: 'admin' } });
    result
      .find('#login-button')
      .first()
      .simulate('click');
    result
      .find('#tokenInput')
      .first()
      .simulate('change', { target: { value: '123123' } });
    await tick();
    result.update();
    expect(result.html().includes('<h1>WebsiteContent</h1>')).toEqual(true);
  });

  it('Clear input fields after entering wrong login information', async () => {
    const loginError = {
      error: 'Password not correct!'
    };

    loginUser.mockReturnValue(Promise.reject(loginError));

    const result = mount(
      <AuthWall setUser={() => {}}>
        <h1>WebsiteContent</h1>
      </AuthWall>
    );

    jest.useFakeTimers();
    await result
      .find('#email')
      .first()
      .simulate('change', { target: { value: 'someMail@teco.edu' } });
    await result
      .find('#password')
      .first()
      .simulate('change', { target: { value: 'wrongPassword' } });
    expect(result.state().usermail).toBe('someMail@teco.edu');
    expect(result.state().password).toBe('wrongPassword');
    await result
      .find('#login-button')
      .first()
      .simulate('click');
    //Don't know why this is necessary
    await flushPromises();
    jest.runAllTimers();
    await flushPromises();
    expect(result.state().usermail).toBe('someMail@teco.edu');
    expect(result.state().password).toBe('');
    expect(
      result
        .find('#password')
        .first()
        .text()
    ).toBe('');

    expect(result.state().authenticationHandlers.didLoginFail).toBe(false);
  });
});

describe('Login with data from localstorage', () => {
  it('Login with token from localstorage', () => {
    getAccessToken.mockReturnValue(jwtValidForever);
    const wrapper = mount(
      <AuthWall setUser={() => {}}>WebsiteContent</AuthWall>
    );
    expect(wrapper.html()).toBe('WebsiteContent');
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(loginUser).not.toBeCalled();
  });

  it('Login with expired token from localstorage', () => {
    getAccessToken.mockReturnValue(jwtNeverValid);
    const wrapper = mount(
      <AuthWall setUser={() => {}}>WebsiteContent</AuthWall>
    );
    expect(wrapper.html()).not.toBe('WebsiteContent');
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(wrapper.contains('Explorer Login')).toBe(true);
  });
});

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}
function tick() {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}
