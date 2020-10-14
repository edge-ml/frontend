import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { mount } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import CreateNewDatasetModal from '../../components/CreateNewDatasetModal/CreateNewDatasetModal';
import { createDataset } from '../../services/ApiServices/DatasetServices';
import { fakeDataset_One } from '../fakeData/fakeDatasets';
import {
  processCSV,
  generateTimeSeries,
  calculateStartEndTimes
} from '../../services/CsvService';

jest.mock('../../services/ApiServices/DatasetServices');
jest.mock('../../services/CsvService');

configure({ adapter: new Adapter() });
const csv_dataset_1 = __dirname + '/fakeData/fakeDataSets/testData.csv';
const csv_dataset_2 = __dirname + '/fakeData/fakeDataSets/testData2.csv';

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

function mockSecondFile() {
  const fakeTimeData = [
    [
      [1595506316, 1],
      [1595506317, 2],
      [1595506318, 4],
      [1595506319, 8],
      [1595506320, 8],
      [1595506321, 8],
      [1595506322, 8],
      [1595506323, 8],
      [1595506324, 12],
      [1595506325, 16]
    ]
  ];

  const fakeTimeSeries = [
    {
      data: [1, 2, 4, 8, 8, 8, 8, 8, 12, 16],
      end: 1595506325,
      name: 'n1',
      offset: 0,
      samplingRate: 1,
      start: 1595506316,
      unit: 'u1'
    }
  ];
  processCSV.mockReturnValue(Promise.resolve(fakeTimeData));
  generateTimeSeries.mockReturnValue(fakeTimeSeries);
  calculateStartEndTimes.mockReturnValue({
    start: fakeTimeSeries.start,
    end: fakeTimeSeries.end
  });
}

describe('Create a new dataset', () => {
  it('Clear input after dataset upload', async () => {
    var f = new File([''], csv_dataset_2);
    createDataset.mockReturnValue(Promise.resolve(fakeDataset_One));

    mockSecondFile();

    const fakeComplete = jest.fn();
    const result = mount(
      <CreateNewDatasetModal
        isOpen={true}
        onDatasetComplete={fakeComplete}
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
      .find('#uploadButton')
      .first()
      .simulate('click');
    await flushPromises();
    expect(result.state().files.length).toEqual(0);
    expect(result.state().names.length).toEqual(0);
    expect(result.state().units.length).toEqual(0);
    expect(fakeComplete).toBeCalled();
  });

  it('Cancel clears the modal then closes it', async () => {
    const closeModalFunc = jest.fn();

    var f = new File([''], csv_dataset_1);
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
    var f = new File([''], csv_dataset_1);
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

/*describe("Extend an existing dataset", () => {
  it("Upload new dataset to existing one", async () => {
    var f = new File([''], csv_dataset_2);
    updateDataset.mockReturnValue(Promise.resolve(bothCombined));

    const onCloseModalFunc = jest.fn();
    const onDatasetCompleteFunc = jest.fn();

    const result = mount(<CreateNewDatasetModal dataset={fakeDataset_One} isOpen={true} onDatasetComplete={onDatasetCompleteFunc} onCloseModal={onCloseModalFunc}></CreateNewDatasetModal>)
    result.find('#fileInput').first().simulate('change', { target: { files: [f] } });
    result.find('#nameInput').first().simulate('change', { target: { value: "n2" } })
    result.find('#unitInput').first().simulate('change', { target: { value: "u2" } })
    result.find('#uploadButton').first().simulate('click');
    await flushPromises();
    console.log(result.state())
    //expect(onCloseModalFunc).toHaveBeenCalledTimes(1);
    expect(onDatasetCompleteFunc).toBeCalledWith(bothCombined);
  })
})*/

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}
function tick() {
  return new Promise(resolve => {
    setTimeout(resolve, 0);
  });
}
