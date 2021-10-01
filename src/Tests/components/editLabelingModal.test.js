import { shallow, mount } from 'enzyme';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import EditLabelingModal from '../../components/EditLabelingModal/EditLabelingModal';
import { generateRandomColor } from '../../services/ColorService';
import { fakeDataset_One } from '../fakeData/fakeDatasets';
import { getDatasets } from '../../services/ApiServices/DatasetServices';

jest.mock('../../services/ApiServices/DatasetServices');
jest.mock('../../services/ColorService');

configure({ adapter: new Adapter() });

beforeEach(() => {});

afterEach(() => {
  jest.clearAllMocks();
});

const fakeLabelingData = {
  labeling: {
    labels: ['5f7ef6b2a907aa0013f37a50', '5f7ef6b2a907aa0013f37a51'],
    name: 'test',
    __v: 0,
    _id: '5f7ef6b2a907aa0013f37a52'
  },
  labels: [
    {
      color: '#3A6398',
      name: 'test1',
      __v: 0,
      _id: '5f7ef6b2a907aa0013f37a50'
    },
    {
      color: '#422943',
      name: 'test2',
      __v: 0,
      _id: '5f7ef6b2a907aa0013f37a51'
    }
  ]
};

describe('Create new labeling', () => {
  it('Render modal to create new labeling', () => {
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    const wrapper = mount(
      <EditLabelingModal isOpen={true}></EditLabelingModal>
    );
    expect(wrapper.contains('Add Labeling Set')).toBe(true);
  });

  it('Create new labeling', () => {
    const resultingLabeling = {
      labeling: {
        name: 'newTestLabeling'
      },
      labels: [
        {
          color: '#6E52C3',
          isNewLabel: true,
          name: 'test1'
        }
      ]
    };

    const fakeOnSave = jest.fn();
    generateRandomColor.mockReturnValue('#6E52C3');
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        isNewLabeling={true}
        labels={[]}
        labeling={[]}
        onSave={fakeOnSave}
      ></EditLabelingModal>
    );
    wrapper
      .find('#buttonAddLabel')
      .first()
      .simulate('click');
    wrapper
      .find('#labelingName')
      .first()
      .simulate('change', {
        target: { value: resultingLabeling.labeling.name }
      });
    wrapper
      .find('#labelName0')
      .first()
      .simulate('change', {
        target: { value: resultingLabeling.labels[0].name }
      });
    wrapper
      .find('#buttonSaveLabeling')
      .first()
      .simulate('click');
    expect(fakeOnSave).toBeCalledWith(
      resultingLabeling.labeling,
      resultingLabeling.labels,
      []
    );
  });

  it('Create new labeling with two labels', () => {
    const resultingLabeling = {
      labeling: {
        name: 'newTestLabeling'
      },
      labels: [
        {
          color: '#6E52C3',
          isNewLabel: true,
          name: 'test1'
        },
        {
          color: '#34161C',
          isNewLabel: true,
          name: 'test2'
        }
      ]
    };

    const fakeOnSave = jest.fn();
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        isNewLabeling={true}
        labels={[]}
        labeling={[]}
        onSave={fakeOnSave}
      ></EditLabelingModal>
    );
    wrapper
      .find('#labelingName')
      .first()
      .simulate('change', {
        target: { value: resultingLabeling.labeling.name }
      });

    // Add the first label
    generateRandomColor.mockReturnValue('#6E52C3');
    wrapper
      .find('#buttonAddLabel')
      .first()
      .simulate('click');
    wrapper
      .find('#labelName0')
      .first()
      .simulate('change', {
        target: { value: resultingLabeling.labels[0].name }
      });

    // Add the second label
    generateRandomColor.mockReturnValue('#34161C');
    wrapper
      .find('#buttonAddLabel')
      .first()
      .simulate('click');
    wrapper
      .find('#labelName1')
      .first()
      .simulate('change', {
        target: { value: resultingLabeling.labels[1].name }
      });

    wrapper
      .find('#buttonSaveLabeling')
      .first()
      .simulate('click');
    expect(fakeOnSave).toBeCalledWith(
      resultingLabeling.labeling,
      resultingLabeling.labels,
      []
    );
  });
});

describe('Edit existing labeling', () => {
  it('Render modal to edit labeling', () => {
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        labeling={fakeLabelingData.labeling}
        labels={fakeLabelingData.labels}
      ></EditLabelingModal>
    );
    expect(wrapper.contains('5f7ef6b2a907aa0013f37a52')).toBe(true);
    expect(wrapper.contains('label' + fakeLabelingData.labels[0]['_id']));
    expect(wrapper.contains('label' + fakeLabelingData.labels[1]['_id']));
    expect(
      wrapper
        .find('#labelingName')
        .first()
        .prop('value')
    ).toBe(fakeLabelingData.labeling.name);
  });

  it('Extend labeling with new label', () => {
    const labelingToExtend = {
      labeling: {
        labels: ['5f7ef79da907aa0013f37a56'],
        name: 'l',
        __v: 0,
        _id: '5f7ef79da907aa0013f37a57'
      },
      labels: [
        {
          color: '#20D39C',
          name: 'l1',
          __v: 0,
          _id: '5f7ef79da907aa0013f37a56'
        }
      ]
    };
    const resultingLabeling = {
      labeling: {
        labels: ['5f7ef79da907aa0013f37a56'],
        name: 'l',
        __v: 0,
        _id: '5f7ef79da907aa0013f37a57'
      },
      labels: [
        {
          color: '#20D39C',
          name: 'l1',
          __v: 0,
          _id: '5f7ef79da907aa0013f37a56'
        },
        {
          color: '#303ED2',
          isNewLabel: true,
          name: 'testlabel'
        }
      ]
    };

    generateRandomColor.mockReturnValue('#303ED2');
    const fakeOnSave = jest.fn();
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        labeling={labelingToExtend.labeling}
        labels={labelingToExtend.labels}
        onSave={fakeOnSave}
      ></EditLabelingModal>
    );
    wrapper
      .find('#buttonAddLabel')
      .first()
      .simulate('click');
    wrapper
      .find('#labelName1')
      .first()
      .simulate('change', { target: { value: 'testlabel' } });
    wrapper
      .find('#buttonSaveLabeling')
      .first()
      .simulate('click');
    expect(fakeOnSave).toBeCalledWith(
      resultingLabeling.labeling,
      resultingLabeling.labels,
      []
    );
  });
});

describe('Delete labeling', () => {
  it('Regular deletion of a labeling', async () => {
    const labelingToDelete = {
      labeling: {
        labels: ['5f7ef79da907aa0013f37a56'],
        name: 'l',
        __v: 0,
        _id: '5f7ef79da907aa0013f37a57'
      },
      labels: [
        {
          color: '#20D39C',
          name: 'l1',
          __v: 0,
          _id: '5f7ef79da907aa0013f37a56'
        }
      ]
    };

    global.confirm = jest.fn(() => true);
    const onFakeDelete = jest.fn();
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        labeling={labelingToDelete.labeling}
        labels={labelingToDelete.labels}
        onDeleteLabeling={onFakeDelete}
      ></EditLabelingModal>
    );
    await flushPromises();
    wrapper
      .find('#buttonDeleteLabeling')
      .first()
      .simulate('click');
    expect(global.confirm).toBeCalled();
    expect(onFakeDelete).toBeCalledWith(labelingToDelete.labeling._id, []);
  });
});

const flushPromises = () => new Promise(setImmediate);
