import { DeleteConfirmationModalView } from '../../../routes/validation/DeleteConfirmationModalView';
import { configure, mount, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

const fakeModelsToDelete = [
  '629cc2228651139c66798254',
  '629cc2228651139c66798255',
];
const fakeOnClosed = jest.fn();
const fakeOnDelete = jest.fn();

it('Render open Delete Model Confirmation Window', () => {
  const wrapper = mount(
    <DeleteConfirmationModalView
      isOpen={true}
      modelsToDelete={fakeModelsToDelete}
      onClosed={fakeOnClosed}
      onDelete={fakeOnDelete}
    />
  );
  expect(wrapper.html()).not.toBe('');
});

it('Render closed Delete Model Confirmation Window', () => {
  const wrapper = mount(
    <DeleteConfirmationModalView
      isOpen={false}
      modelsToDelete={fakeModelsToDelete}
      onClosed={fakeOnClosed}
      onDelete={fakeOnDelete}
    />
  );
  expect(wrapper.html()).toBe('');
});

it('Render Delete Model Confirmation', () => {
  const wrapper = shallow(
    <DeleteConfirmationModalView
      isOpen={true}
      modelsToDelete={fakeModelsToDelete}
      onClosed={fakeOnClosed}
      onDelete={fakeOnDelete}
    ></DeleteConfirmationModalView>
  );
  fakeModelsToDelete.forEach((id) =>
    expect(wrapper.containsMatchingElement(<b>{id}</b>)).toBeTruthy()
  );
});

it('Delete models by button click', () => {
  const wrapper = shallow(
    <DeleteConfirmationModalView
      isOpen={true}
      modelsToDelete={fakeModelsToDelete}
      onClosed={fakeOnClosed}
      onDelete={fakeOnDelete}
    ></DeleteConfirmationModalView>
  );
  wrapper.find('#deleteModelsButtonFinal').first().simulate('click');
  expect(fakeOnDelete).toHaveBeenCalledWith(fakeModelsToDelete);
  expect(fakeOnClosed).toHaveBeenCalledTimes(1);
});

it('Refuse to delete models by button click', () => {
  const wrapper = shallow(
    <DeleteConfirmationModalView
      isOpen={true}
      modelsToDelete={fakeModelsToDelete}
      onClosed={fakeOnClosed}
      onDelete={fakeOnDelete}
    ></DeleteConfirmationModalView>
  );
  wrapper.find('Button').at(1).simulate('click');
  expect(fakeOnDelete).not.toHaveBeenCalled();
  expect(fakeOnClosed).toHaveBeenCalledTimes(1);
});
