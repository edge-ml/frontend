import React, { component } from 'react';
import { unmountComponentAtNode } from 'react-dom';
import AuthWall from '../routes/login';
import { shallow, mount, render } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CreateNewDatasetModal from '../components/CreateNewDatasetModal/CreateNewDatasetModal';
import { createDataset } from '../services/ApiServices/DatasetServices';
import { fakeDataset_One } from './fakeData/fakeDatasets';

jest.mock('../services/ApiServices/DatasetServices');

configure({ adapter: new Adapter() });
const testfile = __dirname + '/fakeData/fakeDataSets/testData.csv';

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

describe('Create a new dataset', () => {
  it('Clear input after dataset upload', async () => {
    var f = new File([''], testfile);
    createDataset.mockReturnValue(Promise.resolve(fakeDataset_One));

    const result = mount(
      <CreateNewDatasetModal
        isOpen={true}
        onDatasetComplete={() => {}}
      ></CreateNewDatasetModal>
    );
    result
      .find('#fileInput')
      .first()
      .simulate('change', {
        target: {
          files: [f]
        }
      });
    await flushPromises();
    result
      .find('#nameInput')
      .first()
      .simulate('change', {
        target: {
          value: 'testName'
        }
      });
    result
      .find('#unitInput')
      .first()
      .simulate('change', {
        target: {
          value: 'testUnit'
        }
      });
    await flushPromises();
    result
      .find('#uploadButton')
      .first()
      .simulate('click');
    await flushPromises();
    expect(result.state().files.length).toEqual(0);
    expect(result.state().names.length).toEqual(0);
    expect(result.state().units.length).toEqual(0);
  });

  it('Cancel clears the modal then closes it', async () => {
    const closeModalFunc = jest.fn();

    var f = new File([''], testfile);
    createDataset.mockReturnValue(Promise.resolve(fakeDataset_One));
    const result = mount(
      <CreateNewDatasetModal
        isOpen={true}
        onDatasetComplete={() => {}}
        onCloseModal={closeModalFunc}
      ></CreateNewDatasetModal>
    );

    result
      .find('#fileInput')
      .first()
      .simulate('change', {
        target: {
          files: [f]
        }
      });
    result
      .find('#nameInput')
      .first()
      .simulate('change', {
        target: {
          value: 'testName'
        }
      });
    result
      .find('#unitInput')
      .first()
      .simulate('change', {
        target: {
          value: 'testUnit'
        }
      });
    result
      .find('#cancelButton')
      .first()
      .simulate('click');
    await flushPromises();
    expect(closeModalFunc).toHaveBeenCalledTimes(1);
    expect(result.state().files.length).toEqual(0);
    expect(result.state().names.length).toEqual(0);
    expect(result.state().units.length).toEqual(0);
  });

  it('First select file then click delete', async () => {
    var f = new File([''], testfile);
    createDataset.mockReturnValue(Promise.resolve(fakeDataset_One));
    const result = mount(
      <CreateNewDatasetModal
        isOpen={true}
        onDatasetComplete={() => {}}
      ></CreateNewDatasetModal>
    );

    result
      .find('#fileInput')
      .first()
      .simulate('change', {
        target: {
          files: [f]
        }
      });
    result
      .find('#nameInput')
      .first()
      .simulate('change', {
        target: {
          value: 'testName'
        }
      });
    result
      .find('#unitInput')
      .first()
      .simulate('change', {
        target: {
          value: 'testUnit'
        }
      });
    result
      .find('#deleteButton')
      .first()
      .simulate('click');
    await flushPromises();
    expect(result.state().files.length).toEqual(0);
    expect(result.state().names.length).toEqual(0);
    expect(result.state().units.length).toEqual(0);
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
