import { generateRandomColor } from '../../services/ColorService';
import {
  processCSV,
  generateDataset,
  generateLabeledDataset
} from '../../services/CsvService';

const path = require('path');
const fs = require('fs');
const util = require('util');

jest.mock('../../services/ColorService');

const fakeCsvPath = path.join(__dirname, '..', 'fakeData', 'data_csv');

const resultProcessCsv = [
  [
    [
      'time',
      'sensor_accX[m/s²]',
      'sensor_accY[m/s²]',
      'sensor_accZ[m/s²]',
      'label_label1',
      'label_label2'
    ],
    ['1628168415000', '2', '2', '2', 'test1', 'test3'],
    ['1628168416000', '4', '2', '4', 'test1', 'test3'],
    ['1628168417000', '8', '3', '8', 'test2', ''],
    ['1628168418000', '16', '4', '16', 'test2', 'test4'],
    ['1628168419000', '16', '4', '16', 'test2', 'test4']
  ]
];

const resultGenerateDataset = {
  datasets: [
    {
      start: 1628168415000,
      end: 1628168419000,
      timeSeries: [
        {
          name: 'accX',
          unit: 'm/s²',
          end: 1628168419000,
          start: 1628168415000,
          data: [
            { timestamp: 1628168415000, datapoint: 2 },
            { timestamp: 1628168416000, datapoint: 4 },
            { timestamp: 1628168417000, datapoint: 8 },
            { timestamp: 1628168418000, datapoint: 16 },
            { timestamp: 1628168419000, datapoint: 16 }
          ]
        },
        {
          name: 'accY',
          unit: 'm/s²',
          end: 1628168419000,
          start: 1628168415000,
          data: [
            { timestamp: 1628168415000, datapoint: 2 },
            { timestamp: 1628168416000, datapoint: 2 },
            { timestamp: 1628168417000, datapoint: 3 },
            { timestamp: 1628168418000, datapoint: 4 },
            { timestamp: 1628168419000, datapoint: 4 }
          ]
        },
        {
          name: 'accZ',
          unit: 'm/s²',
          end: 1628168419000,
          start: 1628168415000,
          data: [
            { timestamp: 1628168415000, datapoint: 2 },
            { timestamp: 1628168416000, datapoint: 4 },
            { timestamp: 1628168417000, datapoint: 8 },
            { timestamp: 1628168418000, datapoint: 16 },
            { timestamp: 1628168419000, datapoint: 16 }
          ]
        }
      ]
    }
  ],
  labelings: [
    [
      {
        datasetLabel: {
          name: 'label1',
          labels: [
            {
              start: '1628168415000',
              end: '1628168416000',
              name: 'test1'
            },
            {
              start: '1628168417000',
              end: '1628168419000',
              name: 'test2'
            }
          ]
        },
        labeling: { name: 'label1' },
        labels: [
          { name: 'test1', color: '#fakeColor', isNewLabel: true },
          { name: 'test2', color: '#fakeColor', isNewLabel: true }
        ]
      },
      {
        datasetLabel: {
          name: 'label2',
          labels: [
            {
              start: '1628168415000',
              end: '1628168416000',
              name: 'test3'
            },
            {
              start: '1628168418000',
              end: '1628168419000',
              name: 'test4'
            }
          ]
        },
        labeling: { name: 'label2' },
        labels: [
          { name: 'test3', color: '#fakeColor', isNewLabel: true },
          { name: 'test4', color: '#fakeColor', isNewLabel: true }
        ]
      }
    ]
  ]
};

const extractedLabelings = [
  {
    labels: ['613f4e87f033ea954af38ee3', '613f4e87f033ea954af38ee4'],
    _id: '613f4e87f033ea954af38ee7',
    name: 'label1',
    __v: 0
  },
  {
    labels: ['613f4e87f033ea954af38ee5', '613f4e87f033ea954af38ee6'],
    _id: '613f4e87f033ea954af38ee8',
    name: 'label2',
    __v: 0
  }
];

const extractedLabels = [
  {
    _id: '613f4e87f033ea954af38ee3',
    name: 'test1',
    color: '#2361A9',
    __v: 0
  },
  {
    _id: '613f4e87f033ea954af38ee4',
    name: 'test2',
    color: '#D460BA',
    __v: 0
  },
  {
    _id: '613f4e87f033ea954af38ee5',
    name: 'test3',
    color: '#4127DB',
    __v: 0
  },
  {
    _id: '613f4e87f033ea954af38ee6',
    name: 'test4',
    color: '#45EEBD',
    __v: 0
  }
];

const currentLabelings = [
  [
    {
      datasetLabel: {
        name: 'label1',
        labels: [
          {
            start: '1628168415000',
            end: '1628168416000',
            name: 'test1',
            type: '613f4e87f033ea954af38ee3'
          },
          {
            start: '1628168417000',
            end: '1628168419000',
            name: 'test2',
            type: '613f4e87f033ea954af38ee4'
          }
        ],
        labelingId: '613f4e87f033ea954af38ee7'
      },
      labeling: {
        name: 'label1'
      },
      labels: [
        {
          name: 'test1',
          color: '#2361A9',
          isNewLabel: true
        },
        {
          name: 'test2',
          color: '#D460BA',
          isNewLabel: true
        }
      ]
    },
    {
      datasetLabel: {
        name: 'label2',
        labels: [
          {
            start: '1628168415000',
            end: '1628168416000',
            name: 'test3',
            type: '613f4e87f033ea954af38ee5'
          },
          {
            start: '1628168418000',
            end: '1628168419000',
            name: 'test4',
            type: '613f4e87f033ea954af38ee6'
          }
        ],
        labelingId: '613f4e87f033ea954af38ee8'
      },
      labeling: {
        name: 'label2'
      },
      labels: [
        {
          name: 'test3',
          color: '#4127DB',
          isNewLabel: true
        },
        {
          name: 'test4',
          color: '#45EEBD',
          isNewLabel: true
        }
      ]
    }
  ]
];

const currentDatasets = [
  {
    start: 1628168415000,
    end: 1628168419000,
    timeSeries: [
      {
        name: 'accX',
        unit: 'm/s²',
        end: 1628168419000,
        start: 1628168415000,
        data: [
          {
            timestamp: 1628168415000,
            datapoint: 2
          },
          {
            timestamp: 1628168416000,
            datapoint: 4
          },
          {
            timestamp: 1628168417000,
            datapoint: 8
          },
          {
            timestamp: 1628168418000,
            datapoint: 16
          },
          {
            timestamp: 1628168419000,
            datapoint: 16
          }
        ]
      },
      {
        name: 'accY',
        unit: 'm/s²',
        end: 1628168419000,
        start: 1628168415000,
        data: [
          {
            timestamp: 1628168415000,
            datapoint: 2
          },
          {
            timestamp: 1628168416000,
            datapoint: 2
          },
          {
            timestamp: 1628168417000,
            datapoint: 3
          },
          {
            timestamp: 1628168418000,
            datapoint: 4
          },
          {
            timestamp: 1628168419000,
            datapoint: 4
          }
        ]
      },
      {
        name: 'accZ',
        unit: 'm/s²',
        end: 1628168419000,
        start: 1628168415000,
        data: [
          {
            timestamp: 1628168415000,
            datapoint: 2
          },
          {
            timestamp: 1628168416000,
            datapoint: 4
          },
          {
            timestamp: 1628168417000,
            datapoint: 8
          },
          {
            timestamp: 1628168418000,
            datapoint: 16
          },
          {
            timestamp: 1628168419000,
            datapoint: 16
          }
        ]
      }
    ],
    name: 'example_new (3)'
  }
];

const labeledDataset = [
  {
    start: 1628168415000,
    end: 1628168419000,
    timeSeries: [
      {
        name: 'accX',
        unit: 'm/s²',
        end: 1628168419000,
        start: 1628168415000,
        data: [
          {
            timestamp: 1628168415000,
            datapoint: 2
          },
          {
            timestamp: 1628168416000,
            datapoint: 4
          },
          {
            timestamp: 1628168417000,
            datapoint: 8
          },
          {
            timestamp: 1628168418000,
            datapoint: 16
          },
          {
            timestamp: 1628168419000,
            datapoint: 16
          }
        ]
      },
      {
        name: 'accY',
        unit: 'm/s²',
        end: 1628168419000,
        start: 1628168415000,
        data: [
          {
            timestamp: 1628168415000,
            datapoint: 2
          },
          {
            timestamp: 1628168416000,
            datapoint: 2
          },
          {
            timestamp: 1628168417000,
            datapoint: 3
          },
          {
            timestamp: 1628168418000,
            datapoint: 4
          },
          {
            timestamp: 1628168419000,
            datapoint: 4
          }
        ]
      },
      {
        name: 'accZ',
        unit: 'm/s²',
        end: 1628168419000,
        start: 1628168415000,
        data: [
          {
            timestamp: 1628168415000,
            datapoint: 2
          },
          {
            timestamp: 1628168416000,
            datapoint: 4
          },
          {
            timestamp: 1628168417000,
            datapoint: 8
          },
          {
            timestamp: 1628168418000,
            datapoint: 16
          },
          {
            timestamp: 1628168419000,
            datapoint: 16
          }
        ]
      }
    ],
    name: 'example_new (3)',
    labelings: [
      {
        name: 'label1',
        labels: [
          {
            start: '1628168415000',
            end: '1628168416000',
            name: 'test1',
            type: '613f4e87f033ea954af38ee3'
          },
          {
            start: '1628168417000',
            end: '1628168419000',
            name: 'test2',
            type: '613f4e87f033ea954af38ee4'
          }
        ],
        labelingId: '613f4e87f033ea954af38ee7'
      },
      {
        name: 'label2',
        labels: [
          {
            start: '1628168415000',
            end: '1628168416000',
            name: 'test3',
            type: '613f4e87f033ea954af38ee5'
          },
          {
            start: '1628168418000',
            end: '1628168419000',
            name: 'test4',
            type: '613f4e87f033ea954af38ee6'
          }
        ],
        labelingId: '613f4e87f033ea954af38ee8'
      }
    ]
  }
];

function readFakeCsvFile(filePath) {
  const csv_dataset = path.join(fakeCsvPath, filePath);
  const fileData = fs.readFileSync(csv_dataset, 'utf-8');
  const file = new File([fileData], csv_dataset);
  return file;
}

describe('Testing function processCSV', () => {
  it('Success case', () => {
    const file = readFakeCsvFile('full_feature_working.csv');
    processCSV([file]).then(data => {
      expect(data).toEqual(resultProcessCsv);
    });
  });
});

describe('Generate dataset and labels', () => {
  it('Success case', () => {
    generateRandomColor.mockReturnValue('#fakeColor');
    const data = generateDataset(resultProcessCsv);
    expect(data).toEqual(resultGenerateDataset);
  });
});

describe('Generate labeld dataset', () => {
  it('Success case', () => {
    const resultDataset = generateLabeledDataset(
      extractedLabelings,
      extractedLabels,
      currentLabelings,
      currentDatasets
    );
    expect(resultDataset).toEqual(labeledDataset);
  });
});
