module.exports.processedCsvNoLabels = [
  [
    ['time', 'sensor_accX[m/s²]', 'sensor_accY[m/s²]', 'sensor_accZ[m/s²]'],
    ['1628168415000', '2', '2', '2'],
    ['1628168416000', '4', '2', '4'],
    ['1628168417000', '8', '3', '8'],
    ['1628168418000', '16', '4', '16'],
    ['1628168419000', '16', '4', '16']
  ]
];

module.exports.proccessedCsvLabels = [
  [
    [
      'time',
      'sensor_accX[m/s²]',
      'sensor_accY[m/s²]',
      'sensor_accZ[m/s²]',
      'label_labeling1_label1',
      'label_labeling1_label2'
    ],
    ['1628168415000', '2', '2', '2', 'x', ''],
    ['1628168416000', '4', '2', '4', 'x', ''],
    ['1628168417000', '8', '3', '8', '', 'x'],
    ['1628168418000', '16', '4', '16', '', 'x'],
    ['1628168419000', '16', '4', '16', '', 'x']
  ]
];

module.exports.generatedDatasetNoLabels = {
  datasets: [
    {
      end: 1628168419000,
      start: 1628168415000,
      timeSeries: [
        {
          data: [
            { datapoint: 2, timestamp: 1628168415000 },
            { datapoint: 4, timestamp: 1628168416000 },
            { datapoint: 8, timestamp: 1628168417000 },
            { datapoint: 16, timestamp: 1628168418000 },
            { datapoint: 16, timestamp: 1628168419000 }
          ],
          end: 1628168419000,
          name: 'accX',
          start: 1628168415000,
          unit: 'm/s²'
        },
        {
          data: [
            { datapoint: 2, timestamp: 1628168415000 },
            { datapoint: 2, timestamp: 1628168416000 },
            { datapoint: 3, timestamp: 1628168417000 },
            { datapoint: 4, timestamp: 1628168418000 },
            { datapoint: 4, timestamp: 1628168419000 }
          ],
          end: 1628168419000,
          name: 'accY',
          start: 1628168415000,
          unit: 'm/s²'
        },
        {
          data: [
            { datapoint: 2, timestamp: 1628168415000 },
            { datapoint: 4, timestamp: 1628168416000 },
            { datapoint: 8, timestamp: 1628168417000 },
            { datapoint: 16, timestamp: 1628168418000 },
            { datapoint: 16, timestamp: 1628168419000 }
          ],
          end: 1628168419000,
          name: 'accZ',
          start: 1628168415000,
          unit: 'm/s²'
        }
      ]
    }
  ],
  labelings: [[]]
};

module.exports.generatedDatasetLabels = {
  datasets: [
    {
      end: 1628168419000,
      start: 1628168415000,
      timeSeries: [
        {
          data: [
            { datapoint: 2, timestamp: 1628168415000 },
            { datapoint: 4, timestamp: 1628168416000 },
            { datapoint: 8, timestamp: 1628168417000 },
            { datapoint: 16, timestamp: 1628168418000 },
            { datapoint: 16, timestamp: 1628168419000 }
          ],
          end: 1628168419000,
          name: 'accX',
          start: 1628168415000,
          unit: 'm/s²'
        },
        {
          data: [
            { datapoint: 2, timestamp: 1628168415000 },
            { datapoint: 2, timestamp: 1628168416000 },
            { datapoint: 3, timestamp: 1628168417000 },
            { datapoint: 4, timestamp: 1628168418000 },
            { datapoint: 4, timestamp: 1628168419000 }
          ],
          end: 1628168419000,
          name: 'accY',
          start: 1628168415000,
          unit: 'm/s²'
        },
        {
          data: [
            { datapoint: 2, timestamp: 1628168415000 },
            { datapoint: 4, timestamp: 1628168416000 },
            { datapoint: 8, timestamp: 1628168417000 },
            { datapoint: 16, timestamp: 1628168418000 },
            { datapoint: 16, timestamp: 1628168419000 }
          ],
          end: 1628168419000,
          name: 'accZ',
          start: 1628168415000,
          unit: 'm/s²'
        }
      ]
    }
  ],
  labelings: [
    [
      {
        datasetLabel: {
          labels: [
            { end: '1628168416000', name: 'label1', start: '1628168415000' },
            { end: '1628168419000', name: 'label2', start: '1628168417000' }
          ],
          name: 'labeling1'
        },
        labeling: { name: 'labeling1' },
        labels: [
          { color: '#ff00ff', isNewLabel: true, name: 'label1' },
          { color: '#ff00ff', isNewLabel: true, name: 'label2' }
        ]
      }
    ]
  ]
};

// Needed to test method "generateLabeledDataset"
module.exports.extractedLabelings = [
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

module.exports.extractedLabels = [
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

module.exports.currentLabelings = [
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

module.exports.currentDatasets = [
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

module.exports.labeledDataset = [
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
