import { unmountComponentAtNode } from 'react-dom';
import AuthWall from '../routes/login';
import { shallow, mount } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import * as AuthentificationServices from '../services/ApiServices/AuthentificationServices';

configure({ adapter: new Adapter() });

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

  it('LoginUser Api call', async () => {
    const fakeLoginData = {
      access_token: 'fakeAccessToken',
      refresh_token: 'fakeRefreshToken',
      twoFactorEnabled: true,
      twoFactorVerified: false
    };

    var mock = new MockAdapter(axios);
    mock.onPost('http://localhost/auth/login').reply(200, fakeLoginData);

    await expect(
      AuthentificationServices.loginUser('no1@teco.edu', 'admin')
    ).resolves.toEqual(fakeLoginData);
  });

  it('Login with 2FA disabled', async () => {
    const fakeLoginData = {
      access_token: 'fakeAccessToken',
      refresh_token: 'fakeRefreshToken',
      twoFactorEnabled: false,
      twoFactorVerified: false
    };

    var mock = new MockAdapter(axios);
    mock.onPost('http://localhost/auth/login').reply(200, fakeLoginData);

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
    expect(result.html().includes('<h1>WebsiteContent</h1>')).toEqual(true);
  });

  it('Login with 2FA enabled', async () => {
    const fakeLoginData = {
      access_token: 'fakeAccessToken',
      refresh_token: 'fakeRefreshToken',
      twoFactorEnabled: true,
      twoFactorVerified: false
    };

    var mock = new MockAdapter(axios);
    mock.onPost('http://localhost/auth/login').reply(200, fakeLoginData);

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
    const fakeLoginData = {
      access_token: 'fakeAccessToken',
      refresh_token: 'fakeRefreshToken',
      twoFactorEnabled: true,
      twoFactorVerified: false
    };

    const fakeTokenData = {
      access_token: 'fakeAccessToken',
      refresh_token: 'fakeRefreshToken',
      twoFactorVerified: true
    };

    var mock = new MockAdapter(axios);
    mock.onPost('http://localhost/auth/login').reply(200, fakeLoginData);
    mock.onPost('http://localhost/auth/2fa/verify').reply(200, fakeTokenData);

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

function tick() {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}
