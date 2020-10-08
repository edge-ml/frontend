import { unmountComponentAtNode } from 'react-dom';
import AuthWall from '../routes/login';
import { shallow, mount } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  login_twoFAEnabled_twoFAVerified,
  loginReturn_twoFAVerified
} from './fakeData/fakeLoginData';

import {
  loginUser,
  verify2FA
} from '../services/ApiServices/AuthentificationServices';

jest.mock('../services/ApiServices/AuthentificationServices');

configure({ adapter: new Adapter() });
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return undefined;
  }

  setItem(key, value) {
    this.store[key] = value.toString();
  }

  removeItem(key) {
    delete this.store[key];
  }
}
global.localStorage = new LocalStorageMock();

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});
describe('Login tests', () => {
  it('Explorer Login rendering', () => {
    const wrapper = shallow(<AuthWall />);
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
    console.log(result.html());
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
    await result
      .find('#email')
      .first()
      .simulate('change', { target: { value: 'no1@teco.edu' } });
    await result
      .find('#password')
      .first()
      .simulate('change', { target: { value: 'admin' } });
    await result
      .find('#login-button')
      .first()
      .simulate('click');
    await tick();
    await result.update();
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
    await result
      .find('#email')
      .first()
      .simulate('change', { target: { value: 'no1@teco.edu' } });
    await result
      .find('#password')
      .first()
      .simulate('change', { target: { value: 'admin' } });
    await result
      .find('#login-button')
      .first()
      .simulate('click');
    await result
      .find('#tokenInput')
      .first()
      .simulate('change', { target: { value: '123123' } });
    await tick();
    await result.update();
    expect(result.html().includes('<h1>WebsiteContent</h1>')).toEqual(true);
  });
});

describe('Token input', () => {
  it('Clear input fields after not successful login', async () => {
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

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}
function tick() {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}
