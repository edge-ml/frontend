import {
  getAccessToken,
  getRefreshToken,
  getProject,
  setToken,
  clearToken,
  setProject
} from '../../services/LocalStorageService';
import { mount, configure, shallow } from 'enzyme';
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn()
};
global.localStorage = localStorageMock;

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

it('getAccessToken', () => {
  localStorageMock.getItem.mockReturnValue('accessToken');
  const token = getAccessToken();
  expect(token).toEqual('accessToken');
  expect(localStorageMock.getItem).toBeCalledWith('access_token');
});

it('getRefreshToken', () => {
  localStorageMock.getItem.mockReturnValue('refreshToken');
  const token = getRefreshToken();
  expect(token).toEqual('refreshToken');
  expect(localStorageMock.getItem).toBeCalledWith('refresh_token');
});

it('setToken', () => {
  setToken('fakeAccessToken', 'fakeRefreshToken');
  expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
  expect(localStorageMock.setItem).toBeCalledWith(
    'access_token',
    'fakeAccessToken'
  );
  expect(localStorageMock.setItem).toBeCalledWith(
    'refresh_token',
    'fakeRefreshToken'
  );
});

it('clearToken', () => {
  clearToken();
  expect(localStorageMock.removeItem).toHaveBeenCalledTimes(3);
  expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
  expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
  expect(localStorageMock.removeItem).toHaveBeenCalledWith('project_id');
});

it('getProject', () => {
  localStorageMock.getItem.mockReturnValue('fakeProject');
  const project = getProject();
  expect(project).toEqual('fakeProject');
  expect(localStorageMock.getItem).toBeCalledWith('project_id');
});

it('setProject', () => {
  setProject('fakeProject');
  expect(localStorageMock.setItem).toHaveBeenCalledWith(
    'project_id',
    'fakeProject'
  );
});
