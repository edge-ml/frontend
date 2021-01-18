import AuthWall from '../../../routes/login';
import { configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {
  login_twoFAEnabled_twoFAVerified,
  loginReturn_twoFAVerified
} from '../../fakeData/fakeLoginData';

import {
  loginUser,
  verify2FA,
  getUserMail
} from '../../../services/ApiServices/AuthentificationServices';

import { jwtValidForever, jwtNeverValid } from '../../fakeData/fakeJwtTokens';

import { getAccessToken } from '../../../services/LocalStorageService';

jest.mock('../../../services/ApiServices/AuthentificationServices');
jest.mock('../../../services/LocalStorageService');

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

describe('Success cases', () => {
  it('Explorer Login rendering', () => {
    const wrapper = mount(<AuthWall />);
    const header = 'Explorer Login';
    expect(wrapper.contains(header)).toEqual(true);
  });

  it('Login with 2FA disabled', async () => {
    loginUser.mockReturnValue(
      Promise.resolve({ access_token: jwtValidForever })
    );
    getUserMail.mockReturnValue(Promise.resolve('fakeUserMail@teco.edu'));
    const result = mount(
      <AuthWall onUserLoggedIn={() => {}}>
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
    loginUser.mockReturnValue(
      Promise.resolve({
        access_token: jwtValidForever,
        twoFactorEnabled: true,
        twoFactorVerified: false
      })
    );

    const result = mount(
      <AuthWall onUserLoggedIn={() => {}}>
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
      Promise.resolve({
        access_token: jwtValidForever,
        twoFactorEnabled: true,
        twoFactorVerified: false
      })
    );
    verify2FA.mockReturnValue(
      Promise.resolve({
        access_token: jwtValidForever,
        isTwoFactorAuthenticated: true
      })
    );

    const result = mount(
      <AuthWall onUserLoggedIn={() => {}}>
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

  it('Login with token from localstorage', () => {
    getAccessToken.mockReturnValue(jwtValidForever);
    const result = mount(
      <AuthWall onUserLoggedIn={() => {}}>WebsiteContent</AuthWall>
    );
    expect(result.html()).toBe('WebsiteContent');
    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(loginUser).not.toBeCalled();
  });

  it('Login with 2FA enabled but click on cancel instead', async () => {
    loginUser.mockReturnValue(
      Promise.resolve({
        access_token: jwtValidForever,
        twoFactorEnabled: false,
        twoFactorVerified: false
      })
    );
    getAccessToken.mockReturnValue(jwtNeverValid);
    const result = mount(
      <AuthWall onUserLoggedIn={() => {}}>
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
    expect(
      result
        .find('#email')
        .first()
        .props().value
    ).toEqual('no1@teco.edu');
    expect(
      result
        .find('#password')
        .first()
        .props().value
    ).toEqual('admin');
    result
      .find('#loginCancelBtn')
      .first()
      .simulate('click');
    await tick();
    result.update();
    expect(
      result
        .find('#email')
        .first()
        .props().value
    ).toEqual('');
    expect(
      result
        .find('#password')
        .first()
        .props().value
    ).toEqual('');
  });
});

describe('Failure cases', () => {
  it('Login with expired token from localstorage', () => {
    getAccessToken.mockReturnValue(jwtNeverValid);
    const wrapper = mount(
      <AuthWall onUserLoggedIn={() => {}}>WebsiteContent</AuthWall>
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
