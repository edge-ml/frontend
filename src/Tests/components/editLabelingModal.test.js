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

const newLabeling = {
  name: '',
  labels: []
};

const newLabel = {
  color: '#FF00FF',
  isNewLabel: true,
  name: 'labelName'
};

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
        labelings={[]}
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
        labelings={[]}
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

  it('Create new labeling with two labels and same name', () => {
    const fakeOnSave = jest.fn();
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        labelings={[]}
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
    generateRandomColor.mockReturnValue('FFCCFF');
    wrapper
      .find('#buttonAddLabel')
      .first()
      .simulate('click');
    wrapper
      .find('#labelName0')
      .first()
      .simulate('change', {
        target: { value: 'sameLabel' }
      });

    // Add the second label

    generateRandomColor.mockReturnValue('FFCCFF');
    wrapper
      .find('#buttonAddLabel')
      .first()
      .simulate('click');
    wrapper
      .find('#labelName1')
      .first()
      .simulate('change', {
        target: { value: 'sameLabel' }
      });

    // Check if the input is marked as invalid
    expect(
      wrapper
        .find('#labelName0')
        .hostNodes()
        .prop('aria-invalid')
    ).toBe(true);
  });

  it('Change color of new label in labeling', async () => {
    generateRandomColor.mockReturnValue('#303ED2');
    const fakeOnSave = jest.fn();
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        labelings={[]}
        datasets={[fakeDataset_One]}
        labeling={newLabeling}
        labels={[]}
        onSave={fakeOnSave}
      ></EditLabelingModal>
    );

    // Name the labeling
    wrapper
      .find('#labelingName')
      .hostNodes()
      .simulate('change', { target: { value: 'labelingName' } });

    // Create a new label
    wrapper
      .find('#buttonAddLabel')
      .hostNodes()
      .simulate('click');
    wrapper
      .find('#labelName0')
      .hostNodes()
      .simulate('change', { target: { value: 'labelName' } });

    // Change the color
    wrapper
      .find('#labelColor0')
      .hostNodes()
      .simulate('change', { target: { value: 'FF00FF' } });
    wrapper
      .find('#buttonSaveLabeling')
      .first()
      .simulate('click');
    expect(fakeOnSave).toBeCalledWith(
      { ...newLabeling, name: 'labelingName', updated: true },
      [newLabel],
      []
    );
  });
  it('Create labeling with same name as other labeling', async () => {
    const fakeOnSave = jest.fn();
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        labelings={[fakeLabelingData.labeling]}
        datasets={[fakeDataset_One]}
        labeling={[]}
        labels={[]}
        onSave={fakeOnSave}
      ></EditLabelingModal>
    );
    wrapper
      .find('#labelingName')
      .hostNodes()
      .simulate('change', {
        target: { value: fakeLabelingData.labeling.name }
      });
    wrapper
      .find('#buttonSaveLabeling')
      .hostNodes()
      .simulate('click');
    expect(fakeOnSave).not.toHaveBeenCalled();
    expect(
      wrapper
        .find('#labelingName')
        .hostNodes()
        .prop('aria-invalid')
    ).toBe(true);
  });
});

describe('Edit existing labeling', () => {
  it('Render modal to edit labeling', () => {
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        datasets={fakeDataset_One}
        labelings={[fakeLabelingData.labeling]}
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
    generateRandomColor.mockReturnValue('#303ED2');
    const fakeOnSave = jest.fn();
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        labelings={[]}
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

  it('Change color of label in labeling', async () => {
    generateRandomColor.mockReturnValue('#303ED2');
    const fakeOnSave = jest.fn();
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        labelings={[]}
        datasets={[fakeDataset_One]}
        labeling={fakeLabelingData.labeling}
        labels={fakeLabelingData.labels}
        onSave={fakeOnSave}
      ></EditLabelingModal>
    );
    wrapper
      .find('#labelColor0')
      .hostNodes()
      .simulate('change', { target: { value: 'FF00FF' } });
    wrapper
      .find('#buttonSaveLabeling')
      .first()
      .simulate('click');

    const expectedLabels = fakeLabelingData.labels;
    expectedLabels[0].color = '#FF00FF';
    expectedLabels[0].updated = true;

    expect(fakeOnSave).toBeCalledWith(
      fakeLabelingData.labeling,
      fakeLabelingData.labels,
      []
    );
  });

  it('Change name of label in labeling', () => {
    generateRandomColor.mockReturnValue('#303ED2');
    const fakeOnSave = jest.fn();
    getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        labelings={[]}
        labeling={fakeLabelingData.labeling}
        labels={fakeLabelingData.labels}
        onSave={fakeOnSave}
      ></EditLabelingModal>
    );
    wrapper
      .find('#labelName' + 0)
      .hostNodes()
      .simulate('change', { target: { value: 'newTestLabelName' } });
    wrapper
      .find('#buttonSaveLabeling')
      .first()
      .simulate('click');

    const expectedLabels = fakeLabelingData.labels;
    expectedLabels[0].name = 'newTestLabelName';
    expectedLabels[0].updated = true;

    expect(fakeOnSave).toBeCalledWith(
      fakeLabelingData.labeling,
      fakeLabelingData.labels,
      []
    );
  });
});

describe('Deleteting', () => {
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
        labelings={[]}
        datasets={[fakeDataset_One]}
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

  it('Delete label from existing labeling', async () => {
    generateRandomColor.mockReturnValue('#303ED2');
    const fakeOnSave = jest.fn();
    //getDatasets.mockReturnValue(Promise.resolve([fakeDataset_One]));
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        datasets={[fakeDataset_One]}
        labelings={[fakeLabelingData.labeling]}
        labeling={fakeLabelingData.labeling}
        labels={fakeLabelingData.labels}
        onSave={fakeOnSave}
      ></EditLabelingModal>
    );
    await flushPromises();
    wrapper
      .find('#buttonDeleteLabel0')
      .hostNodes()
      .simulate('click');
    await flushPromises();
    wrapper
      .find('#buttonSaveLabeling')
      .hostNodes()
      .simulate('click');
    const remainingLabels = [fakeLabelingData.labels[1]];
    const deletedLabelings = [fakeLabelingData.labels[0]];
    expect(fakeOnSave).toBeCalledWith(
      fakeLabelingData.labeling,
      remainingLabels,
      deletedLabelings
    );
  });

  it('Add lables to labeling and delete it again', async () => {
    generateRandomColor.mockReturnValue('#FF00FF');
    const fakeOnSave = jest.fn();
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        labelings={[]}
        isNewLabeling={true}
        labels={[]}
        labeling={newLabeling}
        onSave={fakeOnSave}
      ></EditLabelingModal>
    );

    // Add name to labeling
    wrapper
      .find('#labelingName')
      .hostNodes()
      .simulate('change', { target: { value: 'labelingName' } });

    // Create label and delete it again
    wrapper
      .find('#buttonAddLabel')
      .first()
      .simulate('click');
    wrapper
      .find('#labelName0')
      .first()
      .simulate('change', {
        target: { value: 'fakeName' }
      });
    wrapper
      .find('#buttonDeleteLabel0')
      .hostNodes()
      .simulate('click');

    wrapper
      .find('#buttonSaveLabeling')
      .hostNodes()
      .simulate('click');
    expect(fakeOnSave).toBeCalledWith(
      { ...newLabeling, name: 'labelingName' },
      [],
      []
    );
  });

  it('Delete labeling which exists in dataset and user confirms', async () => {
    const fakeOnSave = jest.fn();
    const fakeOnDeleteLabeling = jest.fn();

    const datasetWithLabels = fakeDataset_One;
    datasetWithLabels.labelings.push({
      labels: [],
      _id: '5f731aa620901e0019d9f323',
      labelingId: fakeLabelingData.labeling._id,
      creator: '5f4390ab80d85700190a9ec3'
    });
    global.confirm = jest.fn(() => true);
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        datasets={[fakeDataset_One]}
        labelings={[fakeLabelingData.labeling]}
        labeling={fakeLabelingData.labeling}
        labels={fakeLabelingData.labels}
        onSave={fakeOnSave}
        onDeleteLabeling={fakeOnDeleteLabeling}
      ></EditLabelingModal>
    );
    wrapper
      .find('#buttonDeleteLabeling')
      .hostNodes()
      .simulate('click');
    expect(fakeOnDeleteLabeling).toBeCalledWith(fakeLabelingData.labeling._id, [
      fakeDataset_One._id
    ]);
  });

  it('Delete labeling which exists in dataset and user declines', async () => {
    const fakeOnSave = jest.fn();
    const fakeOnDeleteLabeling = jest.fn();

    const datasetWithLabels = fakeDataset_One;
    datasetWithLabels.labelings.push({
      labels: [],
      _id: '5f731aa620901e0019d9f323',
      labelingId: fakeLabelingData.labeling._id,
      creator: '5f4390ab80d85700190a9ec3'
    });
    global.confirm = jest.fn(() => false);
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        datasets={[fakeDataset_One]}
        labelings={[fakeLabelingData.labeling]}
        labeling={fakeLabelingData.labeling}
        labels={fakeLabelingData.labels}
        onSave={fakeOnSave}
        onDeleteLabeling={fakeOnDeleteLabeling}
      ></EditLabelingModal>
    );
    wrapper
      .find('#buttonDeleteLabeling')
      .hostNodes()
      .simulate('click');
    expect(fakeOnDeleteLabeling).not.toHaveBeenCalled();
  });

  it('Delete label form labeling which exists in dataset and user confirms', async () => {
    const fakeOnSave = jest.fn();
    global.confirm = jest.fn(() => true);

    const datasetWithLabels = fakeDataset_One;
    datasetWithLabels.labelings.push({
      labels: [{ start: 0, end: 10, type: fakeLabelingData.labels[0]._id }],
      _id: '5f731aa620901e0019d9f323',
      labelingId: fakeLabelingData.labeling._id,
      creator: '5f4390ab80d85700190a9ec3'
    });

    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        datasets={[datasetWithLabels]}
        labelings={[fakeLabelingData.labeling]}
        labeling={fakeLabelingData.labeling}
        labels={fakeLabelingData.labels}
        onSave={fakeOnSave}
      ></EditLabelingModal>
    );
    wrapper
      .find('#buttonDeleteLabel0')
      .hostNodes()
      .simulate('click');
    wrapper
      .find('#buttonSaveLabeling')
      .hostNodes()
      .simulate('click');
    expect(global.confirm).toHaveBeenCalled();
    expect(fakeOnSave).toHaveBeenCalled();
  });

  it('Delelte label from labeling which extists in dataset and user declines', async () => {
    const fakeOnSave = jest.fn();
    global.confirm = jest.fn(() => false);

    const datasetWithLabels = fakeDataset_One;
    datasetWithLabels.labelings.push({
      labels: [{ start: 0, end: 10, type: fakeLabelingData.labels[0]._id }],
      _id: '5f731aa620901e0019d9f323',
      labelingId: fakeLabelingData.labeling._id,
      creator: '5f4390ab80d85700190a9ec3'
    });

    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        datasets={[datasetWithLabels]}
        labelings={[fakeLabelingData.labeling]}
        labeling={fakeLabelingData.labeling}
        labels={fakeLabelingData.labels}
        onSave={fakeOnSave}
      ></EditLabelingModal>
    );
    wrapper
      .find('#buttonDeleteLabel0')
      .hostNodes()
      .simulate('click');
    wrapper
      .find('#buttonSaveLabeling')
      .hostNodes()
      .simulate('click');
    expect(global.confirm).toHaveBeenCalled();
    expect(fakeOnSave).not.toHaveBeenCalled();
  });
});

describe('Close modal', () => {
  it('Close modal by clicking by Cancel', async () => {
    const fakeCloseModal = jest.fn();
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        datasets={[]}
        labelings={[]}
        labeling={[]}
        labels={[]}
        onCloseModal={fakeCloseModal}
      ></EditLabelingModal>
    );
    wrapper
      .find('#buttonClose')
      .hostNodes()
      .simulate('click');
    expect(fakeCloseModal).toHaveBeenCalled();
  });

  it('Close modal by clicking pressing esc', async () => {
    const fakeCloseModal = jest.fn();
    const wrapper = mount(
      <EditLabelingModal
        isOpen={true}
        datasets={[]}
        labelings={[]}
        labeling={[]}
        labels={[]}
        onCloseModal={fakeCloseModal}
      ></EditLabelingModal>
    );

    var event = new KeyboardEvent('keydown', { keyCode: 27 });
    document.dispatchEvent(event);
    expect(fakeCloseModal).toHaveBeenCalled();
  });
});

const flushPromises = () => new Promise(setImmediate);
